import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { removeItem, updateQty, applyCoupon, removeCoupon } from "../features/cart/cartSlice";
import { couponApi } from "../api/couponApi";
import { getErrorMessage } from "../utils/errorMessage";

export default function Cart() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items, couponCode, discount } = useAppSelector((s) => s.cart);
    const [code, setCode] = useState("");
    const [applying, setApplying] = useState(false);

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const total = Math.max(subtotal - discount, 0);

    const handleApplyCoupon = async () => {
        if (!code.trim()) return;
        setApplying(true);
        try {
            const { data } = await couponApi.apply(code.trim(), subtotal);
            dispatch(applyCoupon({ code: data.code, discount: subtotal - data.newTotal }));
            toast.success(`Coupon applied: -₹${subtotal - data.newTotal}`);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Invalid coupon"));
        } finally {
            setApplying(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <Link to="/" className="underline">Browse products</Link>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-xl font-semibold mb-4">Your Cart</h1>

            <div className="flex flex-col gap-3">
                {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between border rounded p-3">
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={(e) =>
                                    dispatch(updateQty({ productId: item.productId, qty: Number(e.target.value) }))
                                }
                                className="w-16 border rounded px-2 py-1"
                            />
                            <button
                                onClick={() => dispatch(removeItem(item.productId))}
                                className="text-red-600 text-sm underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 border-t pt-4">
                {couponCode ? (
                    <div className="flex justify-between items-center mb-3 text-sm">
                        <span>Coupon <strong>{couponCode}</strong> applied</span>
                        <button
                            onClick={() => dispatch(removeCoupon())}
                            className="text-red-600 underline"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 mb-3">
                        <input
                            placeholder="Coupon code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="border rounded px-3 py-2 flex-1"
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={applying}
                            className="bg-gray-800 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {applying ? "Applying..." : "Apply"}
                        </button>
                    </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                    </div>
                )}
                <div className="flex justify-between font-semibold text-lg mt-1">
                    <span>Total</span>
                    <span>₹{total}</span>
                </div>

                <button
                    onClick={() => navigate("/checkout")}
                    className="w-full mt-4 bg-black text-white py-2 rounded"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}