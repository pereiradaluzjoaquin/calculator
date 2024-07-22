const mongoose = require("mongoose");

const OperationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  cost: { type: Number, required: true },
});

const Operation =
  mongoose.model("Operation", OperationSchema) || mongoose.models.Operation;

module.exports = Operation;
