import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  createAssignment,
  getAssignments,
} from "../controllers/assignmentController.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  isAuthorized("Teacher"),
  createAssignment
);

router.get(
  "/:studentId",
  isAuthenticated,
  isAuthorized("Teacher"),
  getAssignments
);

export default router;