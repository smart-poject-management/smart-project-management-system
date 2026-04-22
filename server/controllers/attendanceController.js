import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import {
  assignOcByDepartmentSemester,
  canTeacherManageStudentAttendance,
  getDateAttendanceForStudents,
  getOcAssignments,
  getStudentAttendanceHistory,
  getStudentAttendanceSummary,
  getTeacherAttendanceScope,
  getTeacherOcAssignments,
  getAttendanceOverview,
  getStudentsForAttendance,
  markBulkAttendance,
  updateAttendanceRecord,
} from "../services/attendanceService.js";

const VALID_STATUS = ["Present", "Absent", "Half Day", "Leave"];

export const getStudents = asyncHandler(async (req, res) => {
  const { department, session, semester } = req.query;

  const students = await getStudentsForAttendance({
    teacherId: req.user._id,
    role: req.user.role,
    department,
    session,
    semester,
  });

  res.status(200).json({
    success: true,
    data: { students },
  });
});

export const markAttendanceBulk = asyncHandler(async (req, res, next) => {
  const { records, date } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return next(new ErrorHandler("Attendance records are required", 400));
  }

  if (!date) {
    return next(new ErrorHandler("Date is required", 400));
  }

  const studentIds = records.map((record) => record.studentId);
  const students = await User.find({
    _id: { $in: studentIds },
    role: "Student",
  }).select("_id department semester");

  const studentMap = new Map(students.map((s) => [s._id.toString(), s]));
  let teacherScopeAssignments = [];
  if (req.user.role === "Teacher") {
    teacherScopeAssignments = await getTeacherOcAssignments(req.user._id);
  }

  for (const record of records) {
    if (!record.studentId || !VALID_STATUS.includes(record.status)) {
      return next(new ErrorHandler("Invalid attendance record payload", 400));
    }

    const student = studentMap.get(record.studentId);
    if (!student) {
      return next(new ErrorHandler("Invalid student selected", 400));
    }

    if (req.user.role !== "Teacher") {
      return next(new ErrorHandler("Unauthorized student in attendance list", 403));
    }

    const allowed = canTeacherManageStudentAttendance({
      assignments: teacherScopeAssignments,
      student,
    });
    if (!allowed) {
      return next(
        new ErrorHandler("You are not assigned as OC for this student's semester", 403),
      );
    }
  }

  await markBulkAttendance({
    entries: records.map((record) => ({
      studentId: record.studentId,
      status: record.status,
      date,
    })),
    markedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Attendance marked successfully",
  });
});

export const getAttendanceForDate = asyncHandler(async (req, res, next) => {
  const { date, department, semester, session } = req.query;
  if (!date) {
    return next(new ErrorHandler("Date is required", 400));
  }

  const students = await getStudentsForAttendance({
    teacherId: req.user._id,
    role: req.user.role,
    department,
    session,
    semester,
  });

  const records = await getDateAttendanceForStudents({
    studentIds: students.map((student) => student._id),
    date,
  });

  res.status(200).json({
    success: true,
    data: { records },
  });
});

export const getStudentHistoryForTeacher = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;

  const student = await User.findOne({
    _id: studentId,
    role: "Student",
  }).select("_id department semester");

  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  const teacherAssignments = await getTeacherOcAssignments(req.user._id);
  const allowed = canTeacherManageStudentAttendance({
    assignments: teacherAssignments,
    student,
  });

  if (!allowed) {
    return next(new ErrorHandler("You are not allowed to view this student's history", 403));
  }

  const history = await getStudentAttendanceHistory(studentId);

  res.status(200).json({
    success: true,
    data: { history },
  });
});

export const updateAttendance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUS.includes(status)) {
    return next(
      new ErrorHandler("Status must be Present, Absent, Half Day, or Leave", 400),
    );
  }

  const updated = await updateAttendanceRecord({
    attendanceId: id,
    status,
    markedBy: req.user._id,
  });

  if (!updated) {
    return next(new ErrorHandler("Attendance record not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Attendance updated successfully",
    data: { attendance: updated },
  });
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const [history, summary] = await Promise.all([
    getStudentAttendanceHistory(req.user._id),
    getStudentAttendanceSummary(req.user._id),
  ]);

  res.status(200).json({
    success: true,
    data: {
      history,
      summary,
    },
  });
});

export const getAttendanceOverviewStats = asyncHandler(async (req, res) => {
  const { department, session, semester } = req.query;
  const data = await getAttendanceOverview({ department, session, semester });

  res.status(200).json({
    success: true,
    data,
  });
});

export const assignOc = asyncHandler(async (req, res, next) => {
  const { teacherId, departmentId, semester } = req.body;
  if (!teacherId || !departmentId || !semester) {
    return next(
      new ErrorHandler("Teacher, department and semester are required for OC assignment", 400),
    );
  }

  try {
    const teacher = await assignOcByDepartmentSemester({
      teacherId,
      departmentId,
      semester,
    });

    res.status(200).json({
      success: true,
      message: "OC assigned successfully",
      data: { teacher },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to assign OC", 400));
  }
});

export const listOcAssignments = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const rows = await getOcAssignments({ department });
  res.status(200).json({
    success: true,
    data: { assignments: rows },
  });
});

export const getMyOcAssignments = asyncHandler(async (req, res) => {
  const assignments = await getTeacherOcAssignments(req.user._id);

  res.status(200).json({
    success: true,
    data: { assignments },
  });
});

export const getTeacherAttendanceAccess = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  const scope = await getTeacherAttendanceScope({
    teacherId: req.user._id,
    department,
    semester,
  });

  res.status(200).json({
    success: true,
    data: {
      hasAccess: Boolean(scope),
      scopedDepartment: scope?.department || null,
      scopedSemester: scope?.semester || null,
      assignments: scope?.assignments || [],
    },
  });
});
