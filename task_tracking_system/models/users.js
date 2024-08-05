const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create the User model from the schema
const User = mongoose.model("User", userSchema);
module.exports = User;
