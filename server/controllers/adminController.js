import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as userServices from "../services/userService.js";
import * as projectServices from "../services/projectService.js";
import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";

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

export const getDashboardStates = asyncHandler(async (req, res) => {
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
    message: "Admin Dashboard states fetched",
    data: {
      states: {
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