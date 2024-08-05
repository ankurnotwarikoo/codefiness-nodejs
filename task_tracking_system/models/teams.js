const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User schema
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User schema who created the team
      required: true,
    },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
