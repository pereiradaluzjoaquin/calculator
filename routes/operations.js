const express = require("express");
const Operation = require("../models/Operation");

const router = express.Router();

router.post("/operation", async (req, res) => {
  try {
    const { type, cost } = req.body;
    const operation = new Operation({ type, cost });
    await operation.save();
    res.status(201).json({ message: "Operation created" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
