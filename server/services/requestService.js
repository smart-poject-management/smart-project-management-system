import { SupervisorRequest } from '../models/supervisorRequest.js';

export const createRequest = async (requestData) => {
    const existingRequest = await SupervisorRequest.findOne({
        student: requestData.student,
        supervisor: requestData.supervisor,
        status: "pending"
    });

    if(existingRequest) {
        throw new Error("You have already send a request to this supervisor. Please wait for thier response.");
    }

    const request = new SupervisorRequest(requestData);
    return await request.save();
};