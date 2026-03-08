import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
        type: String,
        default: null
    },
    type: {
        type: String,
        enum: ["general", "request", "approval", "rejection", "deadline","meeting"],
        default: "general"
    },
    priority: {
        type: String,
        enum: ["high","medium","low"],
        default: "low"
    },
  },
  {
    timestamps: true,
  },
);

//indexing for better query performance
notificationSchema.index({ user: 1 , isRead: 1 });

export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
