const express = require("express");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const User = require("../models/User");
const Operation = require("../models/Operation");
const Record = require("../models/Record");
const router = express.Router();

router.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Token is required" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { operation_type, amount } = req.body;
    const user = await User.findById(req.user.id);
    const operation = await Operation.findOne({ type: operation_type });
    if (!operation) {
      return res.status(404).json({ message: "Operation not found" });
    }
    if (user.balance < operation.cost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    let result;
    switch (operation_type) {
      case "addition":
        result = amount + amount;
        break;
      case "subtraction":
        result = amount - amount;
        break;
      case "multiplication":
        result = amount * amount;
        break;
      case "division":
        result = amount / amount;
        break;
      case "square_root":
        result = Math.sqrt(amount);
        break;
      case "random_string":
        const response = await fetch("https://www.random.org/clients");
        const data = await response.text();
        result = data;
        break;
      default:
        return res.status(400).json({ message: "Invalid operation" });
    }
    user.balance -= operation.cost;
    await user.save();
    const record = new Record({
      operation_id: operation._id,
      user_id: user._id,
      amount,
      user_balance: user.balance,
      operation_response: result,
      date: new Date(),
    });
    await record.save();
    res
      .status(201)
      .json({ message: "Operation executed successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const records = await Record.find({ user_id: req.user.id, deleted: false });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    record.deleted = true;
    console.log("record2", record);
    await record.save();
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
