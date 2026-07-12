import request from "supertest";
import app from "../app";

describe("Auth", () => {
  const validUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Passw0rd!",
    phone: "9876543210",
  };

  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "User registered successfully");
      expect(res.body.user).toHaveProperty("email", validUser.email);
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("rejects duplicate email registration", async () => {
      await request(app).post("/api/auth/register").send(validUser);

      const res = await request(app).post("/api/auth/register").send({
        ...validUser,
        name: "Another User",
      });

      expect(res.status).toBe(409);
    });

    it("rejects registration with missing fields", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "incomplete@example.com",
      });

      expect(res.status).toBe(400);
    });

    it("rejects weak password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        ...validUser,
        email: "weakpass@example.com",
        password: "weakpassword",
      });

      expect(res.status).toBe(400);
    });

    it("rejects invalid phone number", async () => {
      const res = await request(app).post("/api/auth/register").send({
        ...validUser,
        email: "badphone@example.com",
        phone: "12345",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
    });

    it("logs in successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", validUser.email);
    });

    it("rejects login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: validUser.email,
        password: "WrongPassw0rd!",
      });

      expect(res.status).toBe(401);
    });

    it("rejects login with non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "doesnotexist@example.com",
        password: validUser.password,
      });

      expect(res.status).toBe(401);
    });
  });
});