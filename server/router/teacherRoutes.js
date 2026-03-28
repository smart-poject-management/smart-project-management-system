import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { getTeacherDashboardStats } from "../controllers/teacherController.js";

const router = express.Router();

router.get(
    "/fetch-dashboard-stats",
    isAuthenticated,
    isAuthorized("Teacher"),
    getTeacherDashboardStats
);

export default router;