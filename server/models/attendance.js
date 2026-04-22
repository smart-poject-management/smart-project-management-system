import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    attendanceDay: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave"],
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

attendanceSchema.index(
  { student: 1, attendanceDay: 1 },
  { unique: true, partialFilterExpression: { attendanceDay: { $exists: true } } },
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
