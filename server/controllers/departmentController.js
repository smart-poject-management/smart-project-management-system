import asyncHandler from '../middlewares/asyncHandler.js';
import { Department } from '../models/Department.js';

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

    const newDepartment = new Department({ department });
    await newDepartment.save();

    res.status(201).json({
        success: true,
        department: newDepartment,
    });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const department = await Department.deleteOne({ _id: id });
    if (!department) {
        return res.status(404).json({ error: 'Department not found' });
    }

    res.status(200).json({
        success: true,
        message: 'Department deleted successfully',
    });
});

export const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        departments,
    });
});
