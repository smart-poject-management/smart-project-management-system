import mongoose from "mongoose";

const deadlineExtensionRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    proof: {
      originalName: { type: String, required: true },
      fileName: { type: String, required: true },
      filePath: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

deadlineExtensionRequestSchema.index({ student: 1, status: 1 });

export const DeadlineExtensionRequest =
  mongoose.models.DeadlineExtensionRequest ||
  mongoose.model("DeadlineExtensionRequest", deadlineExtensionRequestSchema);
