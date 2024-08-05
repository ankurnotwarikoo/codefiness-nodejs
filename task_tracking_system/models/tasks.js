const mongoose = require("mongoose");
const TaskStatus = require("../enums/taskstatus");
const commentSchema = require("../models/comments")

// Define the User Schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5, // Minimum length for title
      maxlength: 100, // Maximum length for title
      unique: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000, // Maximum length for description
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      required: true,
    },
    dueDate: {
      type: Date, // Store as Date object in MongoDB
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // `assignedTo` is a reference to a User document
    },
    comments: [commentSchema]
  },
  { timestamps: true }
);

// Create the Task model from the schema
const Task = mongoose.model("Tasks", taskSchema);
module.exports = Task;
