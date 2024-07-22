require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const Operation = require("../models/Operation");
const Record = require("../models/Record");
const User = require("../models/User");
const recordRoutes = require("../routes/records");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = express();
app.use(express.json());
app.use("/records", recordRoutes);

let mongo;

describe("Record API", () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoURI = await mongo.getUri();
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  afterEach(async () => {
    await Record.deleteMany();
    await User.deleteMany();
    await Operation.deleteMany();
  });

  let token;
  let user;
  let operation;

  beforeEach(async () => {
    user = new User({
      username: "testuser",
      password: "password",
      balance: 100,
    });
    await user.save();
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    operation = new Operation({ type: "addition", cost: 10 });
    await operation.save();
  });

  describe("POST /api/records", () => {
    it("should create a new record", async () => {
      const response = await request(app)
        .post("/records")
        .set("Authorization", token)
        .send({ operation_type: "addition", amount: 10 });
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("Operation executed successfully");
    });

    it("should return 404 if operation not found", async () => {
      const response = await request(app)
        .post("/records")
        .set("Authorization", token)
        .send({ operation_type: "invalid_operation", amount: 10 });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Operation not found");
    });

    it("should return 400 if insufficient balance", async () => {
      user.balance = 0;
      await user.save();
      const response = await request(app)
        .post("/records")
        .set("Authorization", token)
        .send({ operation_type: "addition", amount: 10 });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Insufficient balance");
    });

    it("should return 500 on server error", async () => {
      jest.spyOn(Record.prototype, "save").mockRejectedValue(new Error());
      const response = await request(app)
        .post("/records")
        .set("Authorization", token)
        .send({ operation_type: "addition", amount: 10 });
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app)
        .post("/records")
        .send({ operation_type: "addition", amount: 20 });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Token is required");
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .post("/records")
        .set("Authorization", "invalidtoken")
        .send({ operation_type: "addition", amount: 20 });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid token");
    });
  });

  describe("GET /api/records", () => {
    it("should return all records", async () => {
      await Record.create({
        operation_id: operation._id,
        user_id: user._id,
        amount: 10,
        user_balance: 90,
        operation_response: 20,
        date: new Date(),
      });

      const response = await request(app)
        .get("/records")
        .set("Authorization", token);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app).get("/records");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Token is required");
    });

    it("should return 401 if token is invalid", async () => {
      const res = await request(app)
        .get("/records")
        .set("Authorization", "invalidtoken");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid token");
    });
  });
});
