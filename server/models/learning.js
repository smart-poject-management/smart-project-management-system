import mongoose from "mongoose";

const learningSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    topics: [
      {
        title: String,
        description: String,

        status: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        },

        completedAt: Date,
      },
    ],

    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Learning = mongoose.model("Learning", learningSchema);
