require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authRoutes = require("../routes/auth");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

let mongo;

describe("Auth API", () => {
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

  beforeEach(async () => {
    await User.deleteMany();
  });

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ username: "test", password: "password" });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User created");
  });

  it("should not register a user with the same username", async () => {
    await User.create({ username: "test", password: "password" });
    const response = await request(app)
      .post("/auth/register")
      .send({ username: "test", password: "password" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("should login a user", async () => {
    const password = await bcrypt.hash("password", 10);
    await User.create({ username: "test", password });
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "test", password: "password" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not login a user with invalid password", async () => {
    const password = await bcrypt.hash("password", 10);
    await User.create({ username: "test", password });
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "test", password: "wrongpassword" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid password");
  });

  it("should not login a user that does not exist", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ username: "test", password: "password" });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("User not found");
  });
});
