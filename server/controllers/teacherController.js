import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from '../middlewares/error.js';
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notifications.js";
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateRequestAcceptedTemplate, generateRequestRejectedTemplate } from "../utils/emailTemplates.js";

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

export const getRequests = asyncHandler(async (req, res, next) => {
    const { supervisor } = req.query;
    const filters = {};
    if (supervisor) filters.supervisor = supervisor;

    const { requests, total } = await requestService.getAllRequests(filters);

    const updatedRequests = await Promise.all(requests.map(async (reqObj) => {
        const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;
        if (requestObj?.student?._id) {
            const latestProject = await Project.findOne({
                student: requestObj.student._id
            }).sort({ createdAt: -1 }).lean();

            return { ...requestObj, latestProject };
        }
        return requestObj;
    }));

    res.status(200).json({
        success: true,
        message: "Requests fetched successfully.",
        data: { requests: updatedRequests, total }
    });
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const teacherId = req.user._id;

    const request = await requestService.acceptRequest(requestId, teacherId);
    if (!request) {
        return next(new ErrorHandler("Request not found", 404));
    }

    await notificationService.notifyUser(
        request.student._id,
        `Your supervisor request has been accepted by ${req.user.name}.`,
        "approval",
        "/student/status",
        "low"
    );

    const student = await User.findById(request.student._id);
    const studentEmail = student.email;
    const message = generateRequestAcceptedTemplate(req.user.name);
    await sendEmail({
        to: studentEmail,
        subject: "FYP SYSTEM -✅ Your Supervisor Request Has Been Accepted",
        message
    });

    res.status(200).json({
        success: true,
        message: "Request accepted successfully.",
        data: { request }
    });
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const teacherId = req.user._id;

    const request = await requestService.rejectRequest(requestId, teacherId);
    if (!request) {
        return next(new ErrorHandler("Request not found", 404));
    }

    await notificationService.notifyUser(
        request.student._id,
        `Your supervisor request has been rejected by ${req.user.name}.`,
        "rejection",
        "/student/status",
        "high"
    );
    const student = await User.findById(request.student._id);
    const studentEmail = student.email;
    const message = generateRequestRejectedTemplate(req.user.name);
    await sendEmail({
        to: studentEmail,
        subject: "FYP SYSTEM -❌ Your Supervisor Request Has Been Rejected",
        message
    });

    res.status(200).json({
        success: true,
        message: "Request rejected successfully.",
        data: { request }
    });
});