// src/__tests__/orders.test.ts
import request from "supertest";
import app from "../app";
import Category from "../models/Category";
import Product from "../models/Product";
import Address from "../models/Address";
import Coupon from "../models/Coupon";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

jest.mock("../config/redisClient", () => ({
  __esModule: true,
  default: { del: jest.fn(), get: jest.fn(), set: jest.fn() },
}));

jest.mock("../queue/orderQueue", () => ({
  orderQueue: { add: jest.fn() },
}));

jest.mock("razorpay", () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: "order_test_mock123", amount: 0 }),
    },
  }));
});

async function createTokenForUser(userId: string, role: "user" | "admin" = "user") {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
}

describe("Orders", () => {
  let userId: string;
  let userToken: string;
  let adminToken: string;
  let productId: string;
  let addressId: string;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId().toString();
    userToken = await createTokenForUser(userId, "user");
    adminToken = await createTokenForUser(new mongoose.Types.ObjectId().toString(), "admin");

    const category = await Category.create({ name: "Electronics" });
    const product = await Product.create({
      name: "Wireless Mouse",
      price: 799,
      stock: 10,
      category: category._id,
    });
    productId = product._id.toString();

    const address = await Address.create({
      user: userId,
      fullName: "Test User",
      phone: "9876543210",
      addressLine1: "123 Main St",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
    });
    addressId = address._id.toString();
  });

  describe("POST /api/orders", () => {
    it("creates an order successfully with real DB price", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 2 }],
          address: addressId,
          idempotencyKey: "test-key-001",
        });

      expect(res.status).toBe(201);
      expect(res.body.order.totalAmount).toBe(1598); // 799 * 2, from DB, not client
    });

    it("decrements stock atomically", async () => {
      await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 3 }],
          address: addressId,
          idempotencyKey: "test-key-002",
        });

      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct?.stock).toBe(7); // 10 - 3
    });

    it("rejects order when stock is insufficient", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 999 }],
          address: addressId,
          idempotencyKey: "test-key-003",
        });

      expect(res.status).toBe(409);

      const unchangedProduct = await Product.findById(productId);
      expect(unchangedProduct?.stock).toBe(10); // unchanged
    });

    it("rejects order using another user's address", async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const otherAddress = await Address.create({
        user: otherUserId,
        fullName: "Other User",
        phone: "9876500000",
        addressLine1: "456 Other St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 1 }],
          address: otherAddress._id.toString(),
          idempotencyKey: "test-key-004",
        });

      expect(res.status).toBe(404);
    });

    it("returns the same order for a duplicate idempotency key", async () => {
      const first = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 1 }],
          address: addressId,
          idempotencyKey: "test-key-005",
        });

      const second = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 1 }],
          address: addressId,
          idempotencyKey: "test-key-005",
        });

      expect(second.status).toBe(200);
      expect(second.body.order._id).toBe(first.body.order._id);

      // Stock should only have been decremented ONCE, not twice
      const product = await Product.findById(productId);
      expect(product?.stock).toBe(9); // 10 - 1, not 10 - 2
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("allows a valid transition (pending → processing)", async () => {
      const created = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 1 }],
          address: addressId,
          idempotencyKey: "test-key-006",
        });

      const res = await request(app)
        .patch(`/api/orders/${created.body.order._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "processing" });

      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe("processing");
    });

    it("rejects an invalid transition (pending → delivered)", async () => {
      const created = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 1 }],
          address: addressId,
          idempotencyKey: "test-key-007",
        });

      const res = await request(app)
        .patch(`/api/orders/${created.body.order._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "delivered" });

      expect(res.status).toBe(400);
    });

    it("restores stock when an order is cancelled before shipping", async () => {
      const created = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          items: [{ product: productId, quantity: 2 }],
          address: addressId,
          idempotencyKey: "test-key-008",
        });

      await request(app)
        .patch(`/api/orders/${created.body.order._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "cancelled" });

      const product = await Product.findById(productId);
      expect(product?.stock).toBe(10); // fully restored
    });
  });
});