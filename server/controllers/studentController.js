import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import * as projectServices from "../services/projectService.js";

export const getStudentProject = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const project = await projectServices.getStudentProject(studentId);

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

  const existingUser = await projectServices.getStudentProject(studentId);
  if (existingUser && existingUser.status !== "rejected") {
    return next(
      new Error(
        "Student already has a project assigned or pending approval",
        400,
      ),
    );
  }

  const projectData = {
    student: studentId,
    title,
    description,
  };
  const project = await projectServices.createProject(projectData);
  await User.findByIdAndUpdate(studentId, { project: project._id });

  res.status(201).json({
    success: true,
    data: { project },
    message: "Project created successfully",
  });
});

export const uploadFiles = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectServices.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return res.status(403).json({ error: "Not authorized to upload files to this project." });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const updatedProject = await projectServices.addFilesToProject(projectId, req.files);

  res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    data: { project: updatedProject }
  })
});

export const getAvailableSupervisors = asyncHandler(async (req, res) => {
  const supervisors = await User.find({ role: "Teacher" }).select("name email department expertise").lean();
  res.status(200).json({
    success: true,
    data: { supervisors },
    message: "Available supervisors fetched successfully"
  })
});