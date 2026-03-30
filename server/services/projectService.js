import { Project } from "../models/project.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getStudentProject = async (studentId) => {
  return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

export const createProject = async (projectData) => {
  const project = new Project(projectData);
  return await project.save();
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .populate("feedback.supervisorId", "name email");
  if (!project) {
    return new Error("Project not found", 404);
  }
  return project;
};

export const addFilesToProject = async (projectId, files) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return new Error("Project not found", 404);
  }
  const filesMetaData = files.map((file) => ({
    fileType: file.mimetype,
    fileUrl: path.relative(path.join(__dirname, "../uploads"), file.path),
    originalName: file.originalname,
    uploadedAt: new Date(),
  }));

  project.files.push(...filesMetaData);
  await project.save();
  return project;
};

export const getAllProjects = async () => {
  const projects = await Project.find()
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
  return projects;
};

export const markProjectComplete = async (projectId) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { status: "completed" },
    { new: true, runValidators: true }
  ).populate("student", "name email")
    .populate("supervisor", "name email");

  if (!project) {
    return new Error("Project not found", 404);
  }

  return project;
};

export const addFeedback = async (projectId, feedbackData) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return new Error("Project not found", 404);
  }
  project.feedback.push({
    supervisorId: feedbackData.supervisorId,
    message: feedbackData.message,
    title: feedbackData.title,
    type: feedbackData.type || "general",
  });
  await project.save();
  const latestFeedback = project.feedback[project.feedback.length - 1];
  return { project, latestFeedback };
};

export const getProjectsBySupervisor = async (supervisorId) => {
  const projects = await Project.find({ supervisor: supervisorId })
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
  return projects;
};