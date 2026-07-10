import request from "supertest";
import app from "../app";
import Category from "../models/Category";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

async function createTokenForRole(role: "user" | "admin") {
  const userId = new mongoose.Types.ObjectId().toString();
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
}

describe("Products", () => {
  let categoryId: string;
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    adminToken = await createTokenForRole("admin");
    userToken = await createTokenForRole("user");

    const category = await Category.create({ name: "Electronics" });
    categoryId = category._id.toString();
  });

  describe("POST /api/products", () => {
    it("allows admin to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Wireless Mouse", price: 799, stock: 50, category: categoryId });

      expect(res.status).toBe(201);
      expect(res.body.product).toHaveProperty("name", "Wireless Mouse");
    });

    it("rejects a regular user from creating a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Wireless Mouse", price: 799, stock: 50, category: categoryId });

      expect(res.status).toBe(403);
    });

    it("rejects creation with no token", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({ name: "Wireless Mouse", price: 799, stock: 50, category: categoryId });

      expect(res.status).toBe(401);
    });

    it("rejects an invalid category ID", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Wireless Mouse", price: 799, stock: 50, category: "not-a-valid-id" });

      expect(res.status).toBe(400);
    });

    it("rejects a non-existent category ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Wireless Mouse", price: 799, stock: 50, category: fakeId });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/products/:id", () => {
    it("returns 404 for a non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/products/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/products/:id", () => {
    it("allows admin to update a product", async () => {
      const created = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Wireless Mouse", price: 799, stock: 50, category: categoryId });

      const productId = created.body.product._id;

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ price: 699 });

      expect(res.status).toBe(200);
      expect(res.body.product.price).toBe(699);
    });

    it("rejects a regular user from updating a product", async () => {
      const created = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Wireless Mouse", price: 799, stock: 50, category: categoryId });

      const productId = created.body.product._id;

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: 699 });

      expect(res.status).toBe(403);
    });
  });
});