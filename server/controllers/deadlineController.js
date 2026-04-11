import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { Deadline } from "../models/deadline.js";
import { Project } from "../models/project.js";
import { getProjectById } from "../services/projectService.js";
import * as notificationService from "../services/notificationService.js"; // 🔥 ADD

export const createDeadline = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { dueDate } = req.body;

  if (!dueDate) {
    return next(new ErrorHandler("Due date is required.", 400));
  }

  const project = await getProjectById(id);

  if (!project) {
    return next(new ErrorHandler("Project not found.", 404));
  }

  if (project.status === "completed") {
    return next(
      new ErrorHandler("Cannot create deadlines for completed projects.", 400),
    );
  }

  const existingDeadline = await Deadline.find({ project: project._id }).sort({
    createdAt: 1,
  });

  if (existingDeadline.length >= 2) {
    return next(
      new ErrorHandler(
        "Cannot create more than 2 deadlines for a project.",
        400,
      ),
    );
  }

  let name = "Submission Deadline";

  if (existingDeadline.length === 1) {
    const oldDeadline = existingDeadline[0];

    if (new Date(dueDate) <= oldDeadline.dueDate) {
      return next(
        new ErrorHandler(
          "New deadline must be later than the existing deadline.",
          400,
        ),
      );
    }

    await Deadline.findByIdAndUpdate(oldDeadline._id, {
      status: "missed",
    });

    name = "Last Submission Deadline";
  }

  const deadline = new Deadline({
    name,
    dueDate: new Date(dueDate),
    createdBy: req.user._id,
    project: project._id,
  });

  await deadline.save();

  await deadline.populate([
    { path: "createdBy", select: "name email" },
    { path: "project", select: "title student" },
  ]);

  // UPDATE PROJECT
  await Project.findByIdAndUpdate(
    project._id,
    { deadline: dueDate },
    { returnDocument: "after", runValidators: true },
  );

  // 🔔🔥 NOTIFICATION FIX (MAIN PART)
  if (project?.student?._id) {
    await notificationService.notifyUser(
      project.student._id,
      `New deadline "${name}" has been added to your project "${project.title}".`,
      "deadline",
      "/student/supervisor",
      "medium",
      req.user._id,
      "student",
    );
  }

  return res.status(201).json({
    success: true,
    message: "Deadline created successfully.",
    data: { deadline },
  });
});
