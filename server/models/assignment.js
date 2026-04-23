import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    dueDate: Date,

    status: {
      type: String,
      enum: ["pending", "submitted", "completed"],
      default: "pending",
    },

    submission: {
      fileUrl: String,
      submittedAt: Date,
    },
  },
  { timestamps: true },
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
