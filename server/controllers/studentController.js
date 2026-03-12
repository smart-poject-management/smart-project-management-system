import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import * as projectService from "../services/projectService.js";
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";

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

  const projectData = {
    student: studentId,
    title,
    description,
  };
  const project = await projectService.createProject(projectData);
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
  const project = await projectService.getProjectById(projectId);

  if (!project || project.student._id.toString() !== studentId.toString()) {
    return res.status(403).json({ error: "Not authorized to upload files to this project." });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const updatedProject = await projectService.addFilesToProject(projectId, req.files);

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

export const getSupervisor = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department expertise"
  );

  if (!student.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet"
    });
  }

  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor }
  });

});

export const requestSupervisor = asyncHandler(async (req, res) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;

  const student = await User.findById(studentId);
  if (student.supervisor) {
    return res.status(400).json({ message: "You already have a supervisor assigned." });
  }

  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return res.status(400).json({ message: "Invalid supervisor selected." });
  }

  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return res.status(400).json({ message: "Selected supervisor has reached maximum student capacity." });
  }

  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message
  };

  const request = await requestService.createRequest(requestData);
  await notificationService.notifyUser(
    teacherId,
    `${student.name} has request ${supervisor.name} to be their supervisor.`,
    "request",
    "/teacher/requests",
    "medium"
  );

  res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request submitted successfully."
  });
  
});