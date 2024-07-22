const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  operation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Operation",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  user_balance: { type: Number, required: true },
  operation_response: { type: String, required: true },
  date: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
});

const Record = mongoose.model("Record", RecordSchema) || mongoose.models.Record;

module.exports = Record;
