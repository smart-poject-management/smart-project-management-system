import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  completeAssignment,
  createAssignment,
  deleteAssignment,
  getAssignments,
  markAsRead,
  submitAssignment,
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
  getAssignments
);
router.put(
  "/submit/:id",
  isAuthenticated,
  submitAssignment
);
router.put(
  "/complete/:id",
  isAuthenticated,
  completeAssignment
);
router.put(
  "/read/:id",
  isAuthenticated,
  markAsRead
);
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Teacher"),
  deleteAssignment
);
export default router;
