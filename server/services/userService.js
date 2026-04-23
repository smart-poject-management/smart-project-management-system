import { User } from "../models/user.js"
import { Project } from "../models/project.js"
import { SupervisorRequest } from "../models/supervisorRequest.js"
import { Notification } from "../models/notifications.js"
import { Deadline } from "../models/deadline.js"
import { Attendance } from "../models/attendance.js"

export const createUser = async (userData) => {
    try {
        const user = new User(userData);
        return await user.save();
    } catch (error) {
        throw new Error(`Error creating user: ${error.message}`)
    }
};

export const updateUser = async (id, updateData) => {
    try {
        return await User.findByIdAndUpdate(id, updateData, {
            returnDocument: "after",
            runValidators: true
        }).select("-password");
    } catch (error) {
        throw new Error(`Error updating user: ${error.message}`)
    }
};

export const getUserById = async (id) => {
    return await User.findById(id).select(
        "-password -resetPasswordToken -resetPasswordExpire"
    )
};

export const deleteUser = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    if (user.role === "Student") {
        const studentProject = await Project.findOne({ student: id });

        await Project.deleteOne({ student: id });

        await Deadline.deleteMany({ project: studentProject?._id });

        await SupervisorRequest.deleteMany({ student: id });
        await Attendance.deleteMany({ student: id });

        if (user.supervisor) {
            await User.findByIdAndUpdate(
                user.supervisor,
                { $pull: { assignedStudents: id } },
                { returnDocument: "after" }
            );
        }
    }

    if (user.role === "Teacher") {
        await Deadline.deleteMany({ createdBy: id });

        await SupervisorRequest.deleteMany({ supervisor: id });

        await Project.updateMany(
            { supervisor: id },
            { supervisor: null }
        );

        await User.updateMany(
            { supervisor: id, role: "Student" },
            { supervisor: null }
        );

        if (user.assignedStudents && user.assignedStudents.length > 0) {
            await User.updateMany(
                { _id: { $in: user.assignedStudents } },
                { supervisor: null }
            );
        }

        await Attendance.deleteMany({ markedBy: id });
    }

    await Notification.deleteMany({ user: id });

    await User.updateMany(
        { assignedStudents: id },
        { $pull: { assignedStudents: id } }
    );
    return await user.deleteOne();
};

export const getAllUsers = async () => {
    const query = { role: { $ne: "Admin" } };
    const users = await User.find(query)
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .populate("department", "department")
        .populate("expertise", "name")
        .sort({ createdAt: -1 });

    return users;
};

export const assignSupervisorDirectly = async (studentId, supervisorId) => {
    const student = await User.findOne({ _id: studentId, role: "Student" });
    const supervisor = await User.findOne({ _id: supervisorId, role: "Teacher" });
    if (!student || !supervisor) {
        throw new Error("Student or Supervisor not found");
    }

    if (!supervisor.hasCapacity()) {
        throw new Error("Supervisor ");
    }

    student.supervisor = supervisorId;
    supervisor.assignedStudents.push(studentId);
    await Promise.all([student.save(), supervisor.save()]);

    return { student, supervisor };
};