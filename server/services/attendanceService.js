import mongoose from "mongoose";
import { Attendance } from "../models/attendance.js";
import { User } from "../models/user.js";
import { buildStudentFilters } from "../utils/studentFilters.js";
import { calculateAttendancePercentage } from "../utils/attendanceUtils.js";

const normalizeDate = (value) => {
  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const PRESENT_UNITS_EXPR = {
  $switch: {
    branches: [
      { case: { $eq: ["$status", "Present"] }, then: 1 },
      { case: { $eq: ["$status", "Half Day"] }, then: 0.5 },
    ],
    default: 0,
  },
};

export const markBulkAttendance = async ({ entries, markedBy }) => {
  const operations = entries.map((entry) => ({
    updateOne: {
      filter: {
        student: entry.studentId,
        date: normalizeDate(entry.date),
      },
      update: {
        $setOnInsert: {
          student: entry.studentId,
          date: normalizeDate(entry.date),
          markedBy,
        },
        $set: {
          status: entry.status,
          markedBy,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(operations, { ordered: false });
};

export const updateAttendanceRecord = async ({ attendanceId, status, markedBy }) =>
  Attendance.findByIdAndUpdate(
    attendanceId,
    { status, markedBy },
    { new: true, runValidators: true },
  );

export const getStudentsForAttendance = async ({
  teacherId,
  role,
  department,
  session,
  semester,
}) => {
  const filters = buildStudentFilters({ department, session, semester });

  // Teachers should be able to mark attendance for all students;
  // filtering is handled by optional department/session/semester params.
  // Keep teacherId/role in signature for future role-specific policy extensions.
  void teacherId;
  void role;

  const students = await User.find(filters)
    .select("name email roll_no department semester session")
    .populate("department", "department")
    .sort({ createdAt: -1 })
    .lean();

  // Temporary debug log for attendance fetch flow.
  console.log("[Attendance][Service] getStudentsForAttendance", {
    filters,
    count: students.length,
  });

  return students;
};

export const getStudentAttendanceHistory = async (studentId) =>
  Attendance.find({ student: studentId })
    .sort({ date: -1 })
    .populate("markedBy", "name email")
    .lean();

export const getStudentAttendanceSummary = async (studentId) => {
  const objectId = new mongoose.Types.ObjectId(studentId);
  const aggregation = await Attendance.aggregate([
    { $match: { student: objectId } },
    {
      $group: {
        _id: "$student",
        total: { $sum: 1 },
        present: {
          $sum: PRESENT_UNITS_EXPR,
        },
      },
    },
  ]);

  const summary = aggregation[0] || { total: 0, present: 0 };
  return {
    total: summary.total,
    present: summary.present,
    percentage: calculateAttendancePercentage(summary.present, summary.total),
  };
};

export const getAttendanceOverview = async ({ department, session, semester }) => {
  const filters = buildStudentFilters({ department, session, semester });
  const students = await User.find(filters)
    .select("name email roll_no department semester session")
    .populate("department", "department")
    .lean();

  const studentIds = students.map((student) => student._id);
  if (!studentIds.length) {
    return { rows: [], totals: { students: 0, present: 0, classes: 0, percentage: 0 } };
  }

  const summaryRows = await Attendance.aggregate([
    { $match: { student: { $in: studentIds } } },
    {
      $group: {
        _id: "$student",
        total: { $sum: 1 },
        present: {
          $sum: PRESENT_UNITS_EXPR,
        },
      },
    },
  ]);

  const summaryMap = new Map(summaryRows.map((row) => [row._id.toString(), row]));
  const rows = students.map((student) => {
    const stats = summaryMap.get(student._id.toString()) || { total: 0, present: 0 };
    return {
      student,
      total: stats.total,
      present: stats.present,
      percentage: calculateAttendancePercentage(stats.present, stats.total),
    };
  });

  const present = rows.reduce((acc, row) => acc + row.present, 0);
  const classes = rows.reduce((acc, row) => acc + row.total, 0);

  return {
    rows,
    totals: {
      students: rows.length,
      present,
      classes,
      percentage: calculateAttendancePercentage(present, classes),
    },
  };
};
