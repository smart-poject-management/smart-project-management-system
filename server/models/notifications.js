import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    link: {
      type: String,
      default: null,
    },

    type: {
      type: String,
      enum: [
        "general",
        "request",
        "approval",
        "rejection",
        "deadline",
        "meeting",
        "feedback",
        "system",
      ],
      default: "general",
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },

    receiverRole: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    entityType: {
      type: String,
      enum: ["project", "proposal", "deadline", "system"],
      default: "system",
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
