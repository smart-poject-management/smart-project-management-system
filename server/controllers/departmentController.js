import asyncHandler from '../middlewares/asyncHandler.js';
import { Department, Expertise } from '../models/department.js';

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

    const newExpertise = new Expertise({ name, department: departmentId });
    await newExpertise.save();

    res.status(201).json({
        success: true,
        expertise: newExpertise,
    });
});

export const deleteExpertise = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const expertise = await Expertise.deleteOne({ _id: id });
    if (!expertise) {
        return res.status(404).json({ error: 'Expertise not found' });
    }

    res.status(200).json({
        success: true,
        message: 'Expertise deleted successfully',
    });
});

