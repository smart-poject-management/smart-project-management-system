import { Assignment } from "../models/assignment.js";

export const createAssignment = async (req, res) => {
  try {
    const { title, description, studentId, projectId, dueDate } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      student: studentId,
      project: projectId,
      supervisor: req.user._id,
      dueDate,
    });

    res.status(201).json({
      success: true,
      assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const assignments = await Assignment.find({
      student: studentId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};