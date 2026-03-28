import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { Deadline } from "../models/deadline.js";
import { Project } from "../models/project.js";
import { getProjectById } from "../services/projectService.js";

export const createDeadline = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, dueDate } = req.body;
    if (!name || !dueDate) {
        return next(new ErrorHandler("Name and due date are required.", 400));
    }

    const project = await getProjectById(id);
    if(!project){
        return next(new ErrorHandler("Project not found.", 404));
    }

    const deadlineData = {
        name,
        dueDate: new Date(dueDate),
        createdBy: req.user._id,
        project: project._id
    }
    const deadline = new Deadline(deadlineData);
    await deadline.save();
    await deadline.populate([
        { path: "createdBy", select: "name email" },
        { path: "project", select: "title student" }
    ]);

    if (project) {
        await Project.findByIdAndUpdate(
            project._id,
            { deadline: dueDate },
            { new: true, runValidators: true }
        );
    }

    return res.status(201).json({
        success: true,
        message: "Deadline created successfully.",
        data: { deadline }
    });
});