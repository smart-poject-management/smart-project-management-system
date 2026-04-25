import { Assignment } from "../models/assignment.js";
import mongoose from "mongoose";

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
  const { studentId } = req.params;

  const assignments = await Assignment.find({
    student: new mongoose.Types.ObjectId(studentId), // ✅ FIX
  });

  res.json({ assignments });
};

export const submitAssignment = async (req, res) => {
  const { id } = req.params;
  const { fileUrl } = req.body;

  const assignment = await Assignment.findByIdAndUpdate(
    id,
    {
      status: "completed", // 🔥 change status
      submission: {
        fileUrl,
        submittedAt: new Date(),
      },
    },
    { new: true }
  );

  res.json({
    success: true,
    message: "Assignment submitted",
    assignment,
  });
};
export const completeAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    );

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true } 
    );

    console.log("UPDATED ASSIGNMENT:", assignment);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    await assignment.deleteOne();

    res.json({
      success: true,
      message: "Assignment deleted successfully",
      id, 
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};