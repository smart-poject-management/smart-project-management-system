import { Project } from "../models/project.js";

export const getStudentProject = async (studentId) => {

    return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

export const createProject = async (projectData) => {
    const project = new Project(projectData);
    return await project.save();
};

export const getProjectById = async (id) => {
    const project = await Project.findById(id).populate("Student", "name email").populate("supervisor", "name email");
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
        fileUrl: file.path,
        originalName: file.originalName,
        uploadedAt: new Date()
    }));

    project.files.push(...filesMetaData);
    await project.save();
    return project;
}