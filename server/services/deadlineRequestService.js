import { DeadlineExtensionRequest } from "../models/deadlineExtensionRequest.js";

export const createDeadlineExtensionRequest = async (requestData) => {
  const request = new DeadlineExtensionRequest(requestData);
  return await request.save();
};

export const getDeadlineExtensionRequestsByStudent = async (studentId) => {
  return await DeadlineExtensionRequest.find({ student: studentId }).sort({ createdAt: -1 });
};

export const getAllDeadlineExtensionRequests = async () => {
  return await DeadlineExtensionRequest.find().populate("student", "name email").sort({ createdAt: -1 });
};
