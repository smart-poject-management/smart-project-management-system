import express from "express";
import {
  assignSupervisor,
  createStudent,
  createTeacher,
  deleteStudent,
  deleteTeacher,
  getAllProjects,
  getAllUsers,
  getAdminNotifications,
  getAllStudentsFeeStatus,
  getStudentFeeDetails,
  getDashboardStats,
  getProject,
  markAdminNotificationAsRead,
  updateProjectStatus,
  updateTeacher,
} from "../controllers/adminController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
const router = express.Router();

// student routes

router.post(
  "/create-student",
  isAuthenticated,
  isAuthorized("Admin"),
  createStudent,
);

router.delete(
  "/delete-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteStudent,
);

// teacher routes

router.post(
  "/create-teacher",
  isAuthenticated,
  isAuthorized("Admin"),
  createTeacher,
);

router.put(
  "/update-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateTeacher,
);

router.delete(
  "/delete-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteTeacher,
);

router.get(
  "/projects",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllProjects,
);

router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Admin"),
  getDashboardStats,
);

router.get(
  "/all-fees",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllStudentsFeeStatus
);

router.get(
  "/student-fees/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  getStudentFeeDetails
);

router.get(
  "/notifications",
  isAuthenticated,
  isAuthorized("Admin"),
  getAdminNotifications
);

router.patch(
  "/notifications/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  markAdminNotificationAsRead
);

router.get(
  "/fees-status",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllStudentsFeeStatus
);

router.get(
  "/users",
  isAuthenticated,
  isAuthorized("Admin"),
  getAllUsers
);

router.post(
  "/assign-supervisor",
  isAuthenticated,
  isAuthorized("Admin"),
  assignSupervisor
);

router.get(
  "/project/:id", 
  isAuthenticated,
  isAuthorized("Admin"),
  getProject
);

router.put( 
  "/project/:id",
  isAuthenticated,
  isAuthorized("Admin"),  
  updateProjectStatus
);

export default router;
