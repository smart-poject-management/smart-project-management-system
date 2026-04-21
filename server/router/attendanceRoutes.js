import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  getMyAttendance,
  getAttendanceOverviewStats,
  getStudents,
  markAttendanceBulk,
  updateAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get(
  "/overview",
  isAuthenticated,
  isAuthorized("Admin"),
  getAttendanceOverviewStats,
);

router.get(
  "/students",
  isAuthenticated,
  isAuthorized("Teacher", "Admin"),
  getStudents,
);

router.post(
  "/mark-bulk",
  isAuthenticated,
  isAuthorized("Teacher", "Admin"),
  markAttendanceBulk,
);

router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("Teacher", "Admin"),
  updateAttendance,
);

router.get("/my", isAuthenticated, isAuthorized("Student"), getMyAttendance);

export default router;
