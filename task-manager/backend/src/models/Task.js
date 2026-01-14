const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending"
    },
    dueDate: { type: Date, required: true },

    // Optional (Week 3 auth): tie tasks to user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
