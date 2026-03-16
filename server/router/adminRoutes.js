import express from "express";
import {
  createStudent,
  createTeacher,
  deleteStudent,
  deleteTeacher,
  getAllProjects,
  getAllUsers,
  updateStudent,
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

router.put(
  "/update-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateStudent,
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

router.get("/users", isAuthenticated, isAuthorized("Admin"), getAllUsers);

export default router;
