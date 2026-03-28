import { asyncHandler } from "../middlewares/asyncHandler.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notifications.js";

export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
    const teacherId = req.user._id;

    const totalPendingRequests = await SupervisorRequest.countDocuments({
        supervisor: teacherId,
        status: "pending"
    });
    const completedProjects = await Project.countDocuments({
        supervisor: teacherId,
        status: "completed"
    });
    const recentNotifications = await Notification.find({
        user: teacherId
    }).sort({ createdAt: -1 }).limit(5);

    const dashboardStats = {
        totalPendingRequests,
        completedProjects,
        recentNotifications
    };
    res.status(200).json({
        success: true,
        message: "Dashboard stats fetched for teacher successfully.",
        data: { dashboardStats }
    });
});
