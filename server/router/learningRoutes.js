import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import {
  getLearning,
  markTopicComplete,
} from "../controllers/learningController.js";

const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  isAuthorized("Student"),
  getLearning
);

router.put(
  "/complete/:topicId",
  isAuthenticated,
  isAuthorized("Student"),
  markTopicComplete
);

export default router;