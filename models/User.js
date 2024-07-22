const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  balance: {
    type: Number,
    default: 100,
  },
});

const User = mongoose.model("User", UserSchema) || mongoose.models.User;

module.exports = User;
