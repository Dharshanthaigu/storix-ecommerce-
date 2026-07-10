// src/__tests__/coupons.test.ts
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

async function createToken(userId: string, role: "user" | "admin" = "user") {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
}

describe("Coupons", () => {
  let userToken: string;
  let adminToken: string;
  let productId: string;
  let addressId: string;

  beforeEach(async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    userToken = await createToken(userId, "user");
    adminToken = await createToken(new mongoose.Types.ObjectId().toString(), "admin");

    const category = await Category.create({ name: "Electronics" });
    const product = await Product.create({
      name: "Wireless Mouse",
      price: 1000,
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

    await Coupon.create({
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 500,
      expiresAt: new Date("2030-12-31"),
      usageLimit: 2,
    });

    await Coupon.create({
      code: "EXPIRED",
      discountType: "flat",
      discountValue: 100,
      expiresAt: new Date("2020-01-01"), // already expired
      usageLimit: 5,
    });
  });

  it("applies a percentage discount correctly", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ product: productId, quantity: 1 }],
        address: addressId,
        idempotencyKey: "coupon-key-001",
        couponCode: "SAVE10",
      });

    expect(res.status).toBe(201);
    expect(res.body.order.totalAmount).toBe(900); // 1000 - 10%
    expect(res.body.order.discountAmount).toBe(100);
    expect(res.body.order.couponCode).toBe("SAVE10");
  });

  it("rejects an invalid coupon code and rolls back stock", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ product: productId, quantity: 1 }],
        address: addressId,
        idempotencyKey: "coupon-key-002",
        couponCode: "FAKECODE",
      });

    expect(res.status).toBe(400);

    const product = await Product.findById(productId);
    expect(product?.stock).toBe(10); // rolled back, not decremented
  });

  it("rejects an expired coupon", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ product: productId, quantity: 1 }],
        address: addressId,
        idempotencyKey: "coupon-key-003",
        couponCode: "EXPIRED",
      });

    expect(res.status).toBe(400);
  });

  it("enforces the coupon usage limit", async () => {
    // Use the coupon up to its limit (2)
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ product: productId, quantity: 1 }],
        address: addressId,
        idempotencyKey: "coupon-key-004",
        couponCode: "SAVE10",
      });

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ product: productId, quantity: 1 }],
        address: addressId,
        idempotencyKey: "coupon-key-005",
        couponCode: "SAVE10",
      });

    // Third use should be rejected — limit is 2
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ product: productId, quantity: 1 }],
        address: addressId,
        idempotencyKey: "coupon-key-006",
        couponCode: "SAVE10",
      });

    expect(res.status).toBe(400);
  });

  it("rejects orders below the coupon's minimum order value", async () => {
    const cheapCategory = await Category.create({ name: "Cheap Stuff" });
    const cheapProduct = await Product.create({
      name: "Sticker",
      price: 50,
      stock: 10,
      category: cheapCategory._id,
    });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        items: [{ product: cheapProduct._id.toString(), quantity: 1 }],
        address: addressId,
        idempotencyKey: "coupon-key-007",
        couponCode: "SAVE10", // minOrderValue is 500, this order is only 50
      });

    expect(res.status).toBe(400);
  });

  describe("POST /api/coupons (admin)", () => {
    it("allows admin to create a coupon", async () => {
      const res = await request(app)
        .post("/api/coupons")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "NEWCODE",
          discountType: "flat",
          discountValue: 50,
          expiresAt: "2030-01-01T00:00:00.000Z",
        });

      expect(res.status).toBe(201);
    });

    it("rejects a regular user from creating a coupon", async () => {
      const res = await request(app)
        .post("/api/coupons")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          code: "NEWCODE",
          discountType: "flat",
          discountValue: 50,
          expiresAt: "2030-01-01T00:00:00.000Z",
        });

      expect(res.status).toBe(403);
    });

    it("rejects a duplicate coupon code", async () => {
      const res = await request(app)
        .post("/api/coupons")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "SAVE10", // already exists from beforeEach
          discountType: "percentage",
          discountValue: 20,
          expiresAt: "2030-01-01T00:00:00.000Z",
        });

      expect(res.status).toBe(409);
    });
  });
});