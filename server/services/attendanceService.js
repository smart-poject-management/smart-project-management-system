import mongoose from "mongoose";
import { Attendance } from "../models/attendance.js";
import { User } from "../models/user.js";
import { buildStudentFilters } from "../utils/studentFilters.js";
import { calculateAttendancePercentage } from "../utils/attendanceUtils.js";

const normalizeDate = (value) => {
  if (typeof value === "string") {
    const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matched) {
      const [, year, month, day] = matched;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

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

const ensureValidSemester = (semester) => {
  const parsedSemester = Number(semester);
  if (!Number.isInteger(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
    return null;
  }
  return parsedSemester;
};

const getTeacherAssignments = async (teacherId) => {
  const teacher = await User.findOne({ _id: teacherId, role: "Teacher" })
    .select("department ocAssignments")
    .lean();

  return teacher?.ocAssignments || [];
};

const normalizeDepartmentId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const hasAssignmentForPair = (assignments, departmentId, semester) => {
  const targetDepartmentId = normalizeDepartmentId(departmentId);
  return assignments.some((assignment) => {
    const assignmentDepartmentId = normalizeDepartmentId(assignment.department);
    return (
      assignmentDepartmentId === targetDepartmentId &&
      Number(assignment.semester) === Number(semester)
    );
  });
};

export const getTeacherAttendanceScope = async ({
  teacherId,
  department,
  semester,
}) => {
  const assignments = await getTeacherAssignments(teacherId);
  if (!assignments.length) {
    return null;
  }

  if (!department || !semester) {
    return {
      department: assignments[0].department.toString(),
      semester: Number(assignments[0].semester),
      assignments,
    };
  }

  const parsedSemester = ensureValidSemester(semester);
  if (!parsedSemester) {
    return null;
  }

  const isAllowed = hasAssignmentForPair(assignments, department, parsedSemester);
  if (!isAllowed) {
    return null;
  }

  return {
    department,
    semester: parsedSemester,
    assignments,
  };
};

export const markBulkAttendance = async ({ entries, markedBy }) => {
  const currentMarkedAt = new Date();
  const currentAttendanceDay = normalizeDate(currentMarkedAt);

  const operations = entries.map((entry) => ({
    updateOne: {
      filter: {
        student: entry.studentId,
        attendanceDay: currentAttendanceDay,
      },
      update: {
        $setOnInsert: {
          student: entry.studentId,
          attendanceDay: currentAttendanceDay,
        },
        $set: {
          date: currentMarkedAt,
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
  let scopedDepartment = department;
  let scopedSemester = semester;

  if (role === "Teacher") {
    const scope = await getTeacherAttendanceScope({
      teacherId,
      department,
      semester,
    });
    if (!scope) {
      return [];
    }
    scopedDepartment = scope.department;
    scopedSemester = scope.semester;
  }

  const filters = buildStudentFilters({
    department: scopedDepartment,
    session,
    semester: scopedSemester,
  });

  const students = await User.find(filters)
    .select("name email roll_no department semester session")
    .populate("department", "department")
    .sort({ createdAt: -1 })
    .lean();

  return students;
};

export const getDateAttendanceForStudents = async ({ studentIds, date }) => {
  const normalizedDate = normalizeDate(date);

  const records = await Attendance.find({
    student: { $in: studentIds },
    $or: [
      { attendanceDay: normalizedDate },
      { date: normalizedDate },
    ],
  })
    .select("student status date markedBy")
    .populate("markedBy", "name email")
    .lean();

  return records;
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

export const assignOcByDepartmentSemester = async ({
  teacherId,
  departmentId,
  semester,
}) => {
  const parsedSemester = ensureValidSemester(semester);
  if (!parsedSemester) {
    throw new Error("Semester must be between 1 and 8");
  }

  const teacher = await User.findOne({ _id: teacherId, role: "Teacher" });
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (!teacher.department || teacher.department.toString() !== departmentId.toString()) {
    throw new Error("Only same department teacher can be assigned as OC");
  }

  await User.updateMany(
    {
      role: "Teacher",
      _id: { $ne: teacherId },
    },
    {
      $pull: {
        ocAssignments: {
          department: departmentId,
          semester: parsedSemester,
        },
      },
    },
  );

  await User.findByIdAndUpdate(teacherId, {
    $addToSet: {
      ocAssignments: {
        department: departmentId,
        semester: parsedSemester,
      },
    },
  });

  return User.findById(teacherId)
    .select("name email department ocAssignments")
    .populate("department", "department")
    .populate("ocAssignments.department", "department")
    .lean();
};

export const getOcAssignments = async ({ department }) => {
  const query = {
    role: "Teacher",
    ocAssignments: { $exists: true, $ne: [] },
  };
  if (department) {
    query["ocAssignments.department"] = department;
  }

  const teachers = await User.find(query)
    .select("name email department ocAssignments")
    .populate("department", "department")
    .populate("ocAssignments.department", "department")
    .lean();

  const rows = [];
  teachers.forEach((teacher) => {
    (teacher.ocAssignments || []).forEach((assignment) => {
      if (department && assignment.department?._id?.toString() !== department.toString()) {
        return;
      }
      rows.push({
        teacher: {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
        },
        department: assignment.department,
        semester: assignment.semester,
      });
    });
  });

  return rows;
};

export const getTeacherOcAssignments = async (teacherId) => {
  const teacher = await User.findOne({ _id: teacherId, role: "Teacher" })
    .select("ocAssignments")
    .populate("ocAssignments.department", "department")
    .lean();

  return teacher?.ocAssignments || [];
};

export const canTeacherManageStudentAttendance = ({ assignments, student }) =>
  hasAssignmentForPair(assignments, student.department, student.semester);
