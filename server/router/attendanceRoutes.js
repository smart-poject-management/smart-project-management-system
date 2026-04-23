import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  assignOc,
  getAttendanceForDate,
  getMyOcAssignments,
  getStudentHistoryForTeacher,
  getTeacherAttendanceAccess,
  getMyAttendance,
  getAttendanceOverviewStats,
  getStudents,
  listOcAssignments,
  markAttendanceBulk,
  updateAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get(
  "/oc-assignments",
  isAuthenticated,
  isAuthorized("Admin"),
  listOcAssignments,
);

router.post(
  "/oc-assignments",
  isAuthenticated,
  isAuthorized("Admin"),
  assignOc,
);

router.get(
  "/teacher-access",
  isAuthenticated,
  isAuthorized("Teacher"),
  getTeacherAttendanceAccess,
);

router.get(
  "/my-oc-assignments",
  isAuthenticated,
  isAuthorized("Teacher"),
  getMyOcAssignments,
);

router.get(
  "/day-records",
  isAuthenticated,
  isAuthorized("Teacher"),
  getAttendanceForDate,
);

router.get(
  "/student-history/:studentId",
  isAuthenticated,
  isAuthorized("Teacher"),
  getStudentHistoryForTeacher,
);

router.get(
  "/overview",
  isAuthenticated,
  isAuthorized("Admin"),
  getAttendanceOverviewStats,
);

router.get(
  "/students",
  isAuthenticated,
  isAuthorized("Teacher"),
  getStudents,
);

router.post(
  "/mark-bulk",
  isAuthenticated,
  isAuthorized("Teacher"),
  markAttendanceBulk,
);

router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("Teacher"),
  updateAttendance,
);

router.get("/my", isAuthenticated, isAuthorized("Student"), getMyAttendance);

export default router;
