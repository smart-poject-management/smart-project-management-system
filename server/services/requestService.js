import { SupervisorRequest } from '../models/supervisorRequest.js';
import { User } from '../models/user.js';
import { Project } from '../models/project.js';

export const createRequest = async (requestData) => {
    const existingRequest = await SupervisorRequest.findOne({
        student: requestData.student,
        supervisor: requestData.supervisor,
        status: "pending"
    });

    if (existingRequest) {
        throw new Error("You have already send a request to this supervisor. Please wait for thier response.");
    }

    const request = new SupervisorRequest(requestData);
    return await request.save();
};

export const getAllRequests = async (filters) => {
    const requests = await SupervisorRequest.find(filters)
        .populate("student", "name email")
        .populate("supervisor", "name email")
        .sort({ createdAt: -1 });

    const total = await SupervisorRequest.countDocuments(filters);
    return { requests, total };
};

export const acceptRequest = async (requestId, supervisorId) => {
    const request = await SupervisorRequest.findById(requestId)
        .populate("student", "name email supervisor project")
        .populate("supervisor", "name email assignedStudents maxStudents");

    if (!request) throw new Error("Request not found");
    if (request.supervisor._id.toString() !== supervisorId.toString()) {
        throw new Error("You are not authorized to accept this request");
    }
    if (request.status !== "pending") {
        throw new Error("This request has already been processed");
    }
    
    request.status = "accepted";
    await request.save();

    const student = await User.findById(request.student._id);
    if (student) {
        student.supervisor = supervisorId;
        await student.save();
    }

    if (student.project) {
        await Project.findByIdAndUpdate(
            student.project,
            { supervisor: supervisorId },
            { new: true }
        );
    }

    await User.findByIdAndUpdate(
        supervisorId,
        { $addToSet: { assignedStudents: request.student._id } },
        { new: true }
    );

    return request;
};

export const rejectRequest = async (requestId, supervisorId) => {
    const request = await SupervisorRequest.findById(requestId)
        .populate("student", "name email supervisor project")
        .populate("supervisor", "name email assignedStudents maxStudents");

    if (!request) throw new Error("Request not found");
    if (request.supervisor._id.toString() !== supervisorId.toString()) {
        throw new Error("You are not authorized to reject this request");
    }
    if (request.status !== "pending") {
        throw new Error("This request has already been processed");
    }
    request.status = "rejected";
    await request.save();

    return request;
};