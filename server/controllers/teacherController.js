import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notifications.js";
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";
import * as projectService from "../services/projectService.js";
import * as fileServices from "../services/fileServices.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import {
  generateRequestAcceptedTemplate,
  generateRequestRejectedTemplate,
} from "../utils/emailTemplates.js";

export const getTeacherDashboardStats = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  const totalPendingRequests = await SupervisorRequest.countDocuments({
    supervisor: teacherId,
    status: "pending",
  });

  const completedProjects = await Project.countDocuments({
    supervisor: teacherId,
    status: "completed",
  });

  const recentNotifications = await Notification.find({
    user: teacherId,
    receiverRole: "teacher",
  })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched for teacher successfully.",
    data: {
      dashboardStats: {
        totalPendingRequests,
        completedProjects,
        recentNotifications,
      },
    },
  });
});

export const getRequests = asyncHandler(async (req, res) => {
  const { supervisor } = req.query;
  const filters = {};
  if (supervisor) filters.supervisor = supervisor;

  const { requests, total } = await requestService.getAllRequests(filters);

  const updatedRequests = await Promise.all(
    requests.map(async (reqObj) => {
      const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;

      if (requestObj?.student?._id) {
        const latestProject = await Project.findOne({
          student: requestObj.student._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return { ...requestObj, latestProject };
      }

      return requestObj;
    }),
  );

  res.status(200).json({
    success: true,
    message: "Requests fetched successfully.",
    data: { requests: updatedRequests, total },
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
    "/student/supervisor",
    "low",
    req.user._id,
    "student",
  );

  await notificationService.notifyAllAdmins(
    `${req.user.name} accepted a supervisor request of ${request.student.name}.`,
    "approval",
    "/admin/assign-supervisor",
    "low",
    req.user._id,
  );

  const student = await User.findById(request.student._id);

  await sendEmail({
    to: student.email,
    subject: "FYP SYSTEM -✅ Your Supervisor Request Has Been Accepted",
    message: generateRequestAcceptedTemplate(req.user.name),
  });

  res.status(200).json({
    success: true,
    message: "Request accepted successfully.",
    data: { request },
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
    "/student/supervisor",
    "high",
    req.user._id,
    "student",
  );

  await notificationService.notifyAllAdmins(
    `${req.user.name} rejected a supervisor request of ${request.student.name}.`,
    "rejection",
    "/admin/assign-supervisor",
    "medium",
    req.user._id,
  );

  const student = await User.findById(request.student._id);

  await sendEmail({
    to: student.email,
    subject: "FYP SYSTEM -❌ Your Supervisor Request Has Been Rejected",
    message: generateRequestRejectedTemplate(req.user.name),
  });

  res.status(200).json({
    success: true,
    message: "Request rejected successfully.",
    data: { request },
  });
});

export const getAssignedStudents = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  const projects = await Project.find({ supervisor: teacherId })
    .populate("student", "name email department")
    .select("title status student createdAt")
    .sort({ createdAt: -1 });

  const students = projects.map((project) => ({
    _id: project.student._id,
    name: project.student.name,
    email: project.student.email,
    department: project.student.department,
    projectTitle: project.title,
    status: project.status,
    projectId: project._id,
  }));

  res.status(200).json({
    success: true,
    data: { students, total: students.length },
  });
});

export const markComplete = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  const updatedProject = await projectService.markProjectComplete(projectId);

  await updatedProject.populate("student", "name");

  await notificationService.notifyUser(
    updatedProject.student._id,
    `Your project "${updatedProject.title}" has been marked as complete by ${req.user.name}.`,
    "general",
    "/student/supervisor",
    "low",
    req.user._id,
    "student",
  );

  // Admin notification
  //   await notificationService.notifyAllAdmins(
  //     `${req.user.name} marked project "${updatedProject.title}" as completed for ${updatedProject.student.name}`,
  //     "general",
  //     "/admin/projects",
  //     "low",
  //     req.user._id,
  //   );

  res.status(200).json({
    success: true,
    message: "Project marked as completed.",
    data: { project: updatedProject },
  });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const teacherId = req.user._id;
  const { message, title, type } = req.body;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor._id.toString() !== teacherId.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  if (!message || !title) {
    return next(
      new ErrorHandler("Feedback title and message are required", 400),
    );
  }

  const { updatedProject, latestFeedback } = await projectService.addFeedback(
    projectId,
    {
      supervisorId: teacherId,
      message,
      title,
      type: type || "general",
    },
  );

  await notificationService.notifyUser(
    project.student._id,
    `Your project "${project.title}" has received new feedback from ${req.user.name}.`,
    "feedback",
    "/student/feedback",
    type === "positive" ? "low" : type === "negative" ? "high" : "low",
    req.user._id,
    "student",
  );

  res.status(200).json({
    success: true,
    message: "Feedback added successfully.",
    data: { project: updatedProject, feedback: latestFeedback },
  });
});

export const getFiles = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  const projects = await projectService.getProjectsBySupervisor(teacherId);

  const allFiles = projects.flatMap((project) =>
    project.files.map((file) => ({
      ...file.toObject(),
      projectId: project._id,
      projectTitle: project.title,
      studentName: project.student.name,
      studentEmail: project.student.email,
    })),
  );

  res.status(200).json({
    success: true,
    message: "Files fetched successfully.",
    data: { files: allFiles },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const supervisorId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const projectSupervisorId = project.supervisor?._id
    ? project.supervisor._id.toString()
    : project.supervisor.toString();

  if (projectSupervisorId !== supervisorId.toString()) {
    return next(new ErrorHandler("Not authorized", 403));
  }

  const file = project.files.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  try {
    await fileServices.streamDownload(file.fileUrl, file.originalName, res);
  } catch (error) {
    if (res.headersSent) return res.end();
    return next(error);
  }
});
