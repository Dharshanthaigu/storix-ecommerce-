import request from "supertest";
import app from "../app";
import Order from "../models/Order";
import WebhookEvent from "../models/WebhookEvent";
import crypto from "crypto";

function signPayload(payload: object): { body: string; signature: string } {
  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET as string)
    .update(body)
    .digest("hex");
  return { body, signature };
}

describe("Razorpay Webhook", () => {
  let razorpayOrderId: string;
  let orderId: string;

  beforeEach(async () => {
    razorpayOrderId = "order_test_webhook123";
    const order = await Order.create({
      user: "60a000000000000000000001",
      items: [{ product: "60a000000000000000000002", quantity: 1, price: 799 }],
      address: "60a000000000000000000003",
      totalAmount: 799,
      idempotencyKey: `webhook-test-${Date.now()}`,
      paymentStatus: "pending",
      razorpayOrderId,
    });
    orderId = order._id.toString();
  });

  it("confirms payment and updates order on valid signature", async () => {
    const { body, signature } = signPayload({
      event: "payment.captured",
      payload: { payment: { entity: { order_id: razorpayOrderId } } },
    });

    const res = await request(app)
      .post("/api/webhooks/payment")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", signature)
      .set("x-razorpay-event-id", "evt_test_001")
      .send(body);

    expect(res.status).toBe(200);

    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder?.paymentStatus).toBe("paid");
    expect(updatedOrder?.status).toBe("processing");
  });

  it("rejects a request with an invalid signature", async () => {
    const { body } = signPayload({
      event: "payment.captured",
      payload: { payment: { entity: { order_id: razorpayOrderId } } },
    });

    const res = await request(app)
      .post("/api/webhooks/payment")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", "totally-fake-signature")
      .set("x-razorpay-event-id", "evt_test_002")
      .send(body);

    expect(res.status).toBe(400);

    const unchangedOrder = await Order.findById(orderId);
    expect(unchangedOrder?.paymentStatus).toBe("pending"); // untouched
  });

  it("ignores a duplicate event without reprocessing", async () => {
    const { body, signature } = signPayload({
      event: "payment.captured",
      payload: { payment: { entity: { order_id: razorpayOrderId } } },
    });

    await request(app)
      .post("/api/webhooks/payment")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", signature)
      .set("x-razorpay-event-id", "evt_duplicate_001")
      .send(body);

    const res = await request(app)
      .post("/api/webhooks/payment")
      .set("Content-Type", "application/json")
      .set("x-razorpay-signature", signature)
      .set("x-razorpay-event-id", "evt_duplicate_001") // same event ID
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/already processed/i);

    const eventCount = await WebhookEvent.countDocuments({ eventId: "evt_duplicate_001" });
    expect(eventCount).toBe(1); // not duplicated in the log
  });
});