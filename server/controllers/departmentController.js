import asyncHandler from '../middlewares/asyncHandler.js';
import { Department, Expertise } from '../models/department.js';
import { User } from '../models/user.js';
import { Project } from '../models/project.js';
import { SupervisorRequest } from '../models/supervisorRequest.js';
import { Notification } from '../models/notifications.js';
import { Deadline } from '../models/deadline.js';
import { DeadlineExtensionRequest } from '../models/deadlineExtensionRequest.js';

export const createDepartment = asyncHandler(async (req, res) => {
    let { department } = req.body;

    if (!department || department.trim() === '') {
        return res.status(400).json({ error: 'Department is required' });
    }

    department = department.trim();
    const normalizedDepartment = department.toLowerCase().replace(/\s+/g, ' ');
    const existingDepartment = await Department.findOne({ department: normalizedDepartment });
    if (existingDepartment) {
        return res.status(400).json({ error: 'Department already exists' });
    }

    const newDepartment = new Department({ department: normalizedDepartment });
    await newDepartment.save();

    res.status(201).json({
        success: true,
        department: newDepartment,
    });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
        return res.status(404).json({ error: 'Department not found' });
    }

    const users = await User.find({ department: id }, { _id: 1 });
    const userIds = users.map((user) => user._id);

    const departmentExpertise = await Expertise.find({ department: id }, { _id: 1 });
    const expertiseIds = departmentExpertise.map((item) => item._id);

    const projectFilter = {
        $or: [
            { student: { $in: userIds } },
            { supervisor: { $in: userIds } }
        ]
    };
    const projects = await Project.find(projectFilter, { _id: 1 });
    const projectIds = projects.map((project) => project._id);

    await Promise.all([
        Expertise.deleteMany({ department: id }),
        User.updateMany(
            { expertise: { $in: expertiseIds } },
            { $pull: { expertise: { $in: expertiseIds } } }
        ),
        Project.updateMany(
            { requiredExpertise: { $in: expertiseIds } },
            { $unset: { requiredExpertise: "" } }
        ),
        Notification.deleteMany({
            $or: [
                { user: { $in: userIds } },
                { sender: { $in: userIds } }
            ]
        }),
        Deadline.deleteMany({
            $or: [
                { createdBy: { $in: userIds } },
                { project: { $in: projectIds } }
            ]
        }),
        DeadlineExtensionRequest.deleteMany({ student: { $in: userIds } }),
        SupervisorRequest.deleteMany({
            $or: [
                { student: { $in: userIds } },
                { supervisor: { $in: userIds } }
            ]
        }),
        Project.deleteMany(projectFilter),
        User.deleteMany({ department: id }),
        Department.deleteOne({ _id: id })
    ]);

    res.status(200).json({
        success: true,
        message: 'Department deleted successfully',
    });
});

export const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.aggregate([
        {
            $lookup: {
                from: 'expertise',
                localField: '_id',
                foreignField: 'department',
                as: 'expertise'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'department',
                as: 'users'
            }
        },
        {
            $lookup: {
                from: 'projects',
                let: { deptId: '$_id' },
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'student',
                            foreignField: '_id',
                            as: 'studentInfo'
                        }
                    },
                    {
                        $unwind: { path: '$studentInfo', preserveNullAndEmptyArrays: true }
                    },
                    {
                        $match: {
                            $expr: { $eq: ['$studentInfo.department', '$$deptId'] }
                        }
                    }
                ],
                as: 'projects'
            }
        },
        {
            $addFields: {
                expertiseCount: { $size: '$expertise' },
                totalTeacher: {
                    $size: {
                        $filter: {
                            input: '$users',
                            cond: { $eq: ['$$this.role', 'Teacher'] }
                        }
                    }
                },
                totalStudent: {
                    $size: {
                        $filter: {
                            input: '$users',
                            cond: { $eq: ['$$this.role', 'Student'] }
                        }
                    }
                },
                totalProject: { $size: '$projects' }
            }
        },
        {
            $project: {
                expertise: 0,
                users: 0,
                projects: 0
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
        success: true,
        departments,
    });
});

export const getExpertiseByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;

    if (!departmentId) {
        return res.status(400).json({ error: 'Department ID is required' });
    }

    const expertise = await Expertise.find({ department: departmentId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        expertise,
    });
});

export const createExpertise = asyncHandler(async (req, res) => {
    let { name } = req.body;
    const { departmentId } = req.params;

    if (!departmentId) {
        return res.status(400).json({ error: 'Department ID is required' });
    }

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Expertise name is required' });
    }

    name = name.trim();
    const normalizedName = name.toLowerCase().replace(/\s+/g, ' ');
    const existingExpertise = await Expertise.findOne({ name: normalizedName, department: departmentId });
    if (existingExpertise) {
        return res.status(400).json({ error: 'Expertise already exists in this department' });
    }

    const newExpertise = new Expertise({ name: normalizedName, department: departmentId });
    await newExpertise.save();

    res.status(201).json({
        success: true,
        expertise: newExpertise,
    });
});

export const deleteExpertise = asyncHandler(async (req, res) => {
    const { expertiseId, departmentId } = req.params;

    const expertise = await Expertise.deleteOne({ _id: expertiseId, department: departmentId });
    if (!expertise || expertise.deletedCount === 0) {
        return res.status(404).json({ error: 'Expertise not found' });
    }
    await User.updateMany(
        { expertise: expertiseId },
        { $pull: { expertise: expertiseId } }
    );
    await Project.updateMany(
        { requiredExpertise: expertiseId },
        { $unset: { requiredExpertise: "" } }
    );

    res.status(200).json({
        success: true,
        message: 'Expertise deleted successfully',
    });
});
