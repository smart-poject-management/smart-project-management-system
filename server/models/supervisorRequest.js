import mongoose from "mongoose";

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "teacher";
      },
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: ["teacher", "admin"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 250,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

supervisorRequestSchema.index(
  { student: 1, supervisor: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "teacher" } },
);

supervisorRequestSchema.index(
  { student: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "admin" } },
);

supervisorRequestSchema.index({ status: 1 });
supervisorRequestSchema.index({ supervisor: 1 });
supervisorRequestSchema.index({ student: 1 });

export const SupervisorRequest =
  mongoose.models.SupervisorRequest ||
  mongoose.model("SupervisorRequest", supervisorRequestSchema);
