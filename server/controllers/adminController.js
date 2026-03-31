import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as userServices from "../services/userService.js";
import * as projectServices from "../services/projectService.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import ErrorHandler from '../middlewares/error.js';
import * as notificationService from "../services/notificationService.js";

// student controllers
export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;
  if (!name || !password || !email || !department) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Student",
  });
  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role;

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return res.status(404).json({ error: "Student not found" });
  }
  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: { user },
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: "Student not found" });
  }
  if (user.role !== "Student") {
    return res.status(400).json({ error: "User is not a student" });
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

// teacher controllers
export const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, department, maxStudents, expertise } =
    req.body;
  if (
    !name ||
    !password ||
    !email ||
    !department ||
    !maxStudents ||
    !expertise
  ) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Teacher",
    maxStudents,
    expertise: Array.isArray(expertise)
      ? expertise
      : typeof expertise === "string" && expertise.trim() !== ""
        ? expertise.split(",").map((s) => s.trim())
        : [],
  });
  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role;

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return res.status(404).json({ error: "Teacher not found" });
  }
  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: { user },
  });
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: "Teacher not found" });
  }
  if (user.role !== "Teacher") {
    return res.status(400).json({ error: "User is not a Teacher" });
  }

  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});

// get all users with neglect Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userServices.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
  });
});

export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectServices.getAllProjects();
  res.status(200).json({
    success: true,
    message: "Projects fetched successfully",
    data: { projects },
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalTeachers,
    totalProjects,
    pendingRequests,
    completedProjects,
    pendingProjects
  ] = await Promise.all([
    User.countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments(),
    SupervisorRequest.countDocuments({ status: "pending" }),
    Project.countDocuments({ status: "completed" }),
    Project.countDocuments({ status: "pending" })
  ]);

  res.status(200).json({
    success: true,
    message: "Admin Dashboard stats fetched",
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingRequests,
        completedProjects,
        pendingProjects
      }
    }
  })
});

export const assignSupervisor = asyncHandler(async (req, res, next) => {
  const { studentId, supervisorId } = req.body;

  if (!studentId || !supervisorId) {
    return next(new ErrorHandler("Student ID and Supervisor ID are required", 400));
  }

  const project = await Project.findOne({ student: studentId });
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  if (project.supervisor !== null) {
    return next(new ErrorHandler("Supervisor already assigned", 400));
  }

  if (project.status !== "approved") {
    return next(new ErrorHandler("Project not approved yet", 400));
  } else if (project.status === "pending" || project.status === "rejected") {
    return next(new ErrorHandler("Project is in pending state or rejected", 400));
  }

  const { student, supervisor } = await userServices.assignSupervisorDirectly(studentId, supervisorId);

  project.supervisor = supervisor;
  await project.save();

  await notificationService.notifyUser(
    studentId,
    `You have been assigned a supervisor ${supervisor.name}.`,
    "approval",
    "/students/status",
    "low"
  );

  await notificationService.notifyUser(
    supervisorId,
    `The student ${student.name} has been officially assigned to you for FYP supervisor.`,
    "general",
    "/teacher/status",
    "low"
  );

  res.status(200).json({
    success: true,
    message: "Supervisor assigned successfully",
    data: { student, supervisor }
  });
});

export const getProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const project = await projectServices.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const user = req.user;
  const userRole = (user.role || "").toLowerCase();
  const userId = user._id.toString() || user.id;
  const hasAccess =
    userRole === "admin" ||
    (userRole === "teacher" && project.supervisor && project.supervisor._id.toString() === userId) ||
    (userRole === "student" && project.student && project.student._id.toString() === userId);

  if (!hasAccess) {
    return next(new ErrorHandler("Unauthorized access to project details", 403));
  }

  res.status(200).json({
    success: true,
    message: "Project details fetched successfully",
    data: { project },
  });
});

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const updatedData = req.body;
  const user = req.user;

  const project = await projectServices.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const hasAccess =
    user.role === "Admin" ||
    (user.role === "Teacher" && project.supervisor && project.supervisor._id.toString() === user._id);
  if (!hasAccess) {
    return next(new ErrorHandler("Unauthorized access to update project status", 403));
  }

  const updatedProject = await projectServices.updateProjectStatus(projectId, updatedData);
  if (!updatedProject) {
    return next(new ErrorHandler("Failed to update project status", 500));
  }
  res.status(200).json({
    success: true,
    message: "Project status updated successfully",
    data: { project: updatedProject },
  });
});