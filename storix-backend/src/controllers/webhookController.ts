import { Request, Response } from "express";
import WebhookEvent from "../models/WebhookEvent";
import crypto from "crypto";
import Order from "../models/Order";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {

    const signature = req.headers["x-razorpay-signature"] as string

    if (!signature) {
      res.status(400).json({ error: "Missing signature" })
      return
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex")

    if (signature !== expectedSignature) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const payload = JSON.parse(req.body.toString())
    const eventId = req.headers["x-razorpay-event-id"] as string;
    const eventType = payload.event

    if (!eventId || !eventType) {
      res.status(400).json({ error: "Invalid webhook payload" });
      return;
    }

    try {
      await WebhookEvent.create({ eventId, eventType });
    }
    catch (err: any) {
      if (err.code === 11000) {
        res.status(200).json({ message: "Event already processed, ignoring duplicate" });
        return;
      }
      throw err;
    }

    if (eventType === "payment.captured") {
      const razorpayOrderId = payload.payload.payment.entity.order_id;
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: "paid", status: "processing" },
        { returnDocument: "after" }
      );

      if (!order) {
        res.status(404).json({ error: "Order not found for this payment" });
        return;
      }

      res.status(200).json({ message: "Payment confirmed, order updated", order });
      return;
    }

    if (eventType === "payment.failed") {
      const razorpayOrderId = payload.payload.payment.entity.order_id;
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: "failed" }
      );

      res.status(200).json({ message: "Payment failure recorded" });
      return;
    }

    res.status(200).json({ message: "Event received, no action taken" });
  } catch (error) {
    req.log.error({ err: error }, "Webhook error");
    res.status(500).json({ error: "Something went wrong processing webhook" });
  }
};