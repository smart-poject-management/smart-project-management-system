import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import * as projectService from "../services/projectService.js";
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notifications.js";
import { Deadline } from "../models/deadline.js";
import * as fileService from "../services/fileServices.js";
import ErrorHandler from "../middlewares/error.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getStudentProject = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const project = await projectService.getStudentProject(studentId);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: "No project found for this student",
    });
  }
  res.status(200).json({
    success: true,
    data: { project },
    message: "Project retrieved successfully",
  });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const studentId = req.user._id;

  const existingUser = await projectService.getStudentProject(studentId);
  if (existingUser && existingUser.status !== "rejected") {
    return next(
      new Error(
        "Student already has a project assigned or pending approval",
        400,
      ),
    );
  }
  if (existingUser && existingUser.status === "rejected") {
    await Project.findByIdAndDelete(existingUser._id);
  }

  const projectData = {
    student: studentId,
    title,
    description,
  };
  const project = await projectService.createProject(projectData);
  await User.findByIdAndUpdate(studentId, { project: project._id });

  await notificationService.notifyAllAdmins(
    `${req.user.name} submitted a project proposal "${title}" for your review.`,
    "request",
    "/admin/projects",
    "medium",
  );

  res.status(201).json({
    success: true,
    data: { project },
    message: "Project created successfully",
  });
});

export const uploadFiles = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return res
      .status(403)
      .json({ error: "Not authorized to upload files to this project." });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const updatedProject = await projectService.addFilesToProject(
    projectId,
    req.files,
  );

  const studentName = project.student?.name || "A student";
  const projectTitle = project.title || "their project";
  await notificationService.notifyAllAdmins(
    `${studentName} uploaded ${req.files.length} file(s) for project "${projectTitle}".`,
    "request",
    "/admin/projects",
    "low",
  );

  res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    data: { project: updatedProject },
  });
});

export const getAvailableSupervisors = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const supervisors = await User.find({ role: "Teacher" })
    .select("name email department expertise")
    .lean();
  const pendingSupervisorRequestIds =
    await requestService.getPendingSupervisorIdsForStudent(studentId);
  res.status(200).json({
    success: true,
    data: { supervisors, pendingSupervisorRequestIds },
    message: "Available supervisors fetched successfully",
  });
});

export const getSupervisor = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department expertise",
  );

  if (!student.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet",
    });
  }

  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor },
  });
});

export const requestSupervisor = asyncHandler(async (req, res) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  if (typeof message !== "string") {
    return res.status(400).json({ message: "Message is required." });
  }
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return res.status(400).json({ message: "Message cannot be empty." });
  }
  if (trimmedMessage.length > 250) {
    return res
      .status(400)
      .json({ message: "Message must be at most 250 characters." });
  }

  const student = await User.findById(studentId);
  if (student.supervisor) {
    return res
      .status(400)
      .json({ message: "You already have a supervisor assigned." });
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return res.status(400).json({ message: "Invalid supervisor selected." });
  }

  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return res.status(400).json({
      message: "Selected supervisor has reached maximum student capacity.",
    });
  }

  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message,
  };

  const request = await requestService.createRequest(requestData);
  await notificationService.notifyUser(
    teacherId,
    `${student.name} has request ${supervisor.name} to be their supervisor.`,
    "request",
    "/teacher/pending-requests",
    "medium",
  );

  await notificationService.notifyAllAdmins(
    `${student.name} requested ${supervisor.name} as their supervisor.`,
    "request",
    "/admin/assign-supervisor",
    "medium",
  );

  res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request submitted successfully.",
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .populate("supervisor", "name")
    .sort({ createdAt: -1 })
    .lean();

  const upcomingDeadlines = await Deadline.find({
    project: project?._id
  })
    .select("name dueDate")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const topNotification = await Notification.find({ user: studentId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const feedbackNotification =
    project?.feedback && project?.feedback.length > 0
      ? project.feedback
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2)
      : [];

  const supervisorName = project?.supervisor?.name || null;

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      topNotification,
      feedbackNotification,
      supervisorName,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {  // check if the student is authorized to view the feedback and fixing the error of undefined
    return next(
      new ErrorHandler("Not authorized to view feedback for this project", 403),
    );
  }

  const sortedFeedback = project.feedback.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  ).map((f) => ({
    _id: f._id,
    title: f.title,
    message: f.message,
    type: f.type,
    createdAt: f.createdAt,
    supervisorName: f.supervisorId?.name,
    supervisorEmail: f.supervisorId?.email
  }));

  res.status(200).json({
    success: true,
    data: { feedback: sortedFeedback },
  });
});
export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }


  const projectStudentId = project.student?._id
    ? project.student._id.toString()
    : project.student.toString();

  if (projectStudentId !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to download files for this project", 403));
  }

  const file = project.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  try {
    await fileService.streamDownload(file.fileUrl, file.originalName, res);
  } catch (error) {
    if (res.headersSent) return res.end();
    return next(error);
  }
});

export const deleteProjectFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const projectStudentId = project.student?._id
    ? project.student._id.toString()
    : project.student.toString();

  if (projectStudentId !== studentId.toString()) {
    return next(
      new ErrorHandler("Not authorized to delete files for this project", 403),
    );
  }

  const file = project.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  const filePath = file.fileUrl;

  // Remove from DB first 
  project.files = project.files.filter((f) => f._id.toString() !== fileId);
  await project.save();

  if (filePath) {
    const absolutePath = path.join(__dirname, "../uploads", filePath);
    try {
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
      }
    } catch (err) {
      
      console.error("File deletion error:", err);
    }
  }

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
    data: { project },
  });
});
