require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const Operation = require("../models/Operation");
const operationRoutes = require("../routes/operations");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = express();
app.use(express.json());
app.use("/operations", operationRoutes);

let mongo;

describe("Operation API", () => {
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
    await Operation.deleteMany();
  });

  it("should create a new operation", async () => {
    const response = await request(app)
      .post("/operations/operation")
      .send({ type: "expense", cost: 100 });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Operation created");
  });

  it("should return 500 on server error", async () => {
    jest.spyOn(Operation.prototype, "save").mockRejectedValue(new Error());
    const response = await request(app)
      .post("/operations/operation")
      .send({ type: "expense", cost: 100 });
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Internal server error");
  });
});
