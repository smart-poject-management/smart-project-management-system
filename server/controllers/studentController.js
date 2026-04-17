import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import * as projectService from "../services/projectService.js";
import * as requestService from "../services/requestService.js";
import * as deadlineRequestService from "../services/deadlineRequestService.js";
import * as notificationService from "../services/notificationService.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notifications.js";
import { Deadline } from "../models/deadline.js";
import * as fileService from "../services/fileServices.js";
import ErrorHandler from "../middlewares/error.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DeadlineExtensionRequest } from "../models/deadlineExtensionRequest.js";

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
  const { title, description, requiredExpertise } = req.body;
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

  const project = await projectService.createProject({
    student: studentId,
    title,
    description,
    ...(requiredExpertise && { requiredExpertise }),
  });
  await User.findByIdAndUpdate(studentId, { project: project._id });

  await notificationService.notifyAllAdmins(
    `${req.user.name} submitted a project proposal "${title}" for your review.`,
    "request",
    "/admin/projects",
    "medium",
    req.user._id,
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
    return res.status(403).json({ error: "Not authorized" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const updatedProject = await projectService.addFilesToProject(
    projectId,
    req.files,
  );

  res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    data: { project: updatedProject },
  });
});

export const getAvailableSupervisors = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  let student = null;
  let project = null;

  try {
    [student, project] = await Promise.all([
      User.findById(studentId).select("department"),
      projectService.getStudentProject(studentId),
    ]);
  } catch (err) {
    console.log("PROJECT ERROR:", err);
  }

  let supervisorsQuery = { role: "Teacher" };

  if (student?.department) {
    supervisorsQuery.department = student.department;
  }

  if (project?.requiredExpertise) {
    supervisorsQuery.expertise = project.requiredExpertise;
  }

  let supervisors = [];

  try {
    supervisors = await User.find(supervisorsQuery)
      .select("name email department expertise")
      .populate("department", "department")
      .populate("expertise", "name")
      .lean();
  } catch (err) {
    console.log("SUPERVISOR FETCH ERROR:", err);
  }

  let pendingSupervisorRequestIds = [];

  try {
    pendingSupervisorRequestIds =
      await requestService.getPendingSupervisorIdsForStudent(studentId);
  } catch (err) {
    console.log("REQUEST SERVICE ERROR:", err);
  }

  res.status(200).json({
    success: true,
    data: {
      supervisors,
      pendingSupervisorRequestIds,
    },
  });
});

export const getSupervisor = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const student = await User.findById(studentId).populate({
    path: "supervisor",
    select: "name email department expertise",
    populate: [
      { path: "department", select: "department" },
      { path: "expertise", select: "name" },
    ],
  });

  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor || null },
  });
});

export const requestSupervisor = asyncHandler(async (req, res) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  if (!message?.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  const student = await User.findById(studentId);

  if (student.supervisor) {
    return res.status(400).json({ message: "Already assigned" });
  }

  const supervisor = await User.findById(teacherId);

  if (!supervisor || supervisor.role !== "Teacher") {
    return res.status(400).json({ message: "Invalid supervisor" });
  }

  const request = await requestService.createRequest({
    student: studentId,
    supervisor: teacherId,
    message,
    type: "teacher",
  });

  await notificationService.notifyUser(
    teacherId,
    `${student.name} has requested you as supervisor.`,
    "request",
    "/teacher/pending-requests",
    "medium",
    studentId,
    "teacher",
    studentId,
    "system",
  );

  res.status(201).json({
    success: true,
    message: "Request sent to supervisor",
    data: { request },
  });
});

export const requestAdminSupervisor = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);

  if (student.supervisor) {
    return res.status(400).json({ message: "Already assigned" });
  }

  // Store Request
  const request = await requestService.createRequest({
    student: studentId,
    message: message || "Student requested admin to assign supervisor",
    type: "admin",
  });

  await notificationService.notifyAllAdmins(
    `${student.name} requested you to assign a supervisor.`,
    "request",
    "/admin/assign-supervisor",
    "high",
    studentId,
    studentId,
    "system",
  );

  res.status(201).json({
    success: true,
    message: "Request sent to admin",
    data: { request },
  });
});

export const requestDeadlineExtension = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const studentId = req.user._id;
  const exist = await DeadlineExtensionRequest.findOne({ student: studentId });
  if (exist) {
    return res.status(400).json({
      message: "You already have a deadline extension request.",
    });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required." });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Proof file is required." });
  }

  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (trimmedTitle.length > 100) {
    return res
      .status(400)
      .json({ message: "Title must be 100 characters or less." });
  }
  if (trimmedMessage.length > 1000) {
    return res
      .status(400)
      .json({ message: "Message must be 1000 characters or less." });
  }

  const proof = {
    originalName: req.file.originalname,
    fileName: req.file.filename,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
  };

  const request = await deadlineRequestService.createDeadlineExtensionRequest({
    student: studentId,
    title: trimmedTitle,
    message: trimmedMessage,
    proof,
  });

  await notificationService.notifyAllAdmins(
    `${req.user.name} submitted a deadline extension request: ${trimmedTitle}`,
    "request",
    "/admin/deadlines",
    "high",
  );

  res.status(201).json({
    success: true,
    data: { request },
    message: "Deadline extension request submitted successfully.",
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .populate("supervisor", "name")
    .lean();

  const upcomingDeadlines = await Deadline.find({ project: project?._id })
    .limit(2)
    .lean();

  const topNotification = await Notification.find({
    user: studentId,
    receiverRole: "student",
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      project,
      upcomingDeadlines,
      topNotification,
      supervisorName: project?.supervisor?.name || null,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  const feedback = project.feedback.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  res.status(200).json({
    success: true,
    data: { feedback },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.student._id.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  const file = project.files.id(fileId);

  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }

  await fileService.streamDownload(file.fileUrl, file.originalName, res);
});

export const deleteProjectFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  const project = await projectService.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.student._id.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
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
  });
});

export const getDeadlineExtensionRequest = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const request =
    await deadlineRequestService.getDeadlineExtensionRequestsByStudent(
      studentId,
    );
  res.status(200).json({
    success: true,
    data: { request },
  });
});
