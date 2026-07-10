import { Response } from "express";
import Order from "../models/Order";
import Address from "../models/Address";
import Coupon from "../models/Coupon";
import { createOrderSchema } from "../validators/orderValidator";
import { AuthRequest } from "../middleware/authmiddleware";
import Product from "../models/Product";
import { orderQueue } from "../queue/orderQueue";
import { canTransitionStatus, OrderStatus } from "../utils/orderStateMachine";
import { validateAndCalculateCoupon } from "../utils/couponService";
import Razorpay from "razorpay";

const razorpay = new Razorpay({                // ← new: module-level instance
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

//Create order(logged-in user)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsed = createOrderSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message })
            return
        }

        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" })
            return;
        }

        const { items, address, idempotencyKey, couponCode } = parsed.data

        // Idempotency check — prevent duplicate orders from retried requests
        if (idempotencyKey) {
            const existing = await Order.findOne({ idempotencyKey, user: req.user.userId })
            if (existing) {
                res.status(200).json({ message: "Order already placed", order: existing })
                return
            }
        }

        // Confirm the address belongs to this user
        const addressDoc = await Address.findOne({ _id: address, user: req.user.userId })
        if (!addressDoc) {
            res.status(404).json({ error: "Address not found" })
            return
        }

        const decrementedItems: { productId: string; quantity: number }[] = []
        const orderItem: { product: string; quantity: number; price: number }[] = []
        let totalAmount = 0

        for (const item of items) {
            //Atomic: only decrements if stock >= requested quantity 
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { returnDocument: 'after' }
            )

            if (!updatedProduct) {
                // Stock wasn't sufficient — roll back everything decremented so far
                for (const rollback of decrementedItems) {
                    await Product.findByIdAndUpdate(rollback.productId, {
                        $inc: { stock: rollback.quantity }
                    })
                }
                res.status(409).json({
                    error: `Insufficient stock for product ${item.product}`,
                })
                return
            }

            // Use the real price from the DB, never trust the client
            totalAmount += updatedProduct.price * item.quantity
            decrementedItems.push({ productId: item.product, quantity: item.quantity })
            orderItem.push({
                product: item.product,
                quantity: item.quantity,
                price: updatedProduct.price
            })
        }

        // Apply coupon if provided
        let finalAmount = totalAmount
        let appliedCouponCode: string | undefined
        let discountAmount = 0

        if (couponCode) {
            try {
                const result = await validateAndCalculateCoupon(couponCode, totalAmount)
                finalAmount = result.finalTotal
                discountAmount = result.discount
                appliedCouponCode = result.coupon.code

                const updatedCoupon = await Coupon.findOneAndUpdate(
                    { _id: result.coupon._id, usedCount: { $lt: result.coupon.usageLimit } },
                    { $inc: { usedCount: 1 } },
                    { returnDocument: "after" }
                )

                if (!updatedCoupon) {
                    for (const rollback of decrementedItems) {
                        await Product.findByIdAndUpdate(rollback.productId, {
                            $inc: { stock: rollback.quantity }
                        })
                    }
                    res.status(409).json({ error: "Coupon usage limit reached" })
                    return
                }
            } catch (err: any) {
                for (const rollback of decrementedItems) {
                    await Product.findByIdAndUpdate(rollback.productId, {
                        $inc: { stock: rollback.quantity }
                    })
                }
                res.status(400).json({ error: err.message })
                return
            }
        }

        let order
        try {
            order = await Order.create({
                user: req.user.userId,
                items: orderItem,
                address,  
                totalAmount: finalAmount,
                idempotencyKey,
                paymentStatus: "pending",
                ...(appliedCouponCode !== undefined && { couponCode: appliedCouponCode }),
                discountAmount,
            })
        } catch (err) {
            // Order creation failed after stock was already decremented — roll it back
            for (const rollback of decrementedItems) {
                await Product.findByIdAndUpdate(rollback.productId, {
                    $inc: { stock: rollback.quantity }
                })
            }
            throw err
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(finalAmount * 100),
            currency: "INR",
            receipt: order.id,
            notes: {
                internalOrderId: order.id
            },
        })

        order.razorpayOrderId = razorpayOrder.id
        await order.save()

        await orderQueue.add({
            orderId: order.id,
            email: "customer@example.com", // later: pull from req.user or populated User doc
            phone: "9876543210",           // later: pull from user's saved phone
        })

        res.status(201).json({ message: "Order placed successfully", order });

    }
    catch (error) {
        //console.log("Create order error:", error);
        req.log.error({ err: error }, "Create order error");
        res.status(500).json({ error: "Something went wrong while placing order" });
    }
}

// Get logged-in user's orders
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const orders = await Order.find({ user: req.user.userId })
            .populate("items.product", "name price")
            .sort({ createdAt: -1 });

        res.status(200).json({ orders })
    }
    catch (error) {
        //console.log("Get my orders error:", error);
        req.log.error({ err: error }, "Create order error");
        res.status(500).json({ error: "Something went wrong while fetching orders" });
    }
}

// Update order status (admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status: newStatus } = req.body as { status: OrderStatus };

        const order = await Order.findById(req.params.id)
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        if (!canTransitionStatus(order.status as OrderStatus, newStatus)) {
            res.status(400).json({
                error: `Cannot transition order from "${order.status}" to "${newStatus}"`,
            });
            return;
        }

        // If cancelling before shipment, restore stock
        if (newStatus === "cancelled" && order.status !== "shipped" && order.status !== "delivered") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                })
            }
        }

        order.status = newStatus;
        await order.save()
        res.status(200).json({ message: "Order status updated", order });
    }
    catch (error) {
        req.log.error({ err: error }, "Create order error");
        //console.log("Update order status error:", error);
        res.status(500).json({ error: "Something went wrong while updating order status" });
    }
}

