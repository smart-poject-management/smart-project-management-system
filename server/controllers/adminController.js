import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as userServices from '../services/userService.js'

export const createStudent = asyncHandler(async (req, res) => {
    const { name, email, password, department } = req.body;
    if (!name || !password || !email || !department) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }
    const user = await userServices.createUser({ name, email, password, department, role: "Student" });
    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: { user }
    })
});

export const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.role;

    const user = await userServices.updateUser(id, updateData);
    if (!user) {
        return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: { user }
    })
});

export const deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userServices.getUserById(id);
    if (!user) {
        return res.status(404).json({ error: "Student not found" });
    }
    if (user.role !== "Student") {
        return res.status(400).json({ error: "User is not a student"});
    }

    await userServices.deleteUser(id);
    res.status(200).json({
        success: true,
        message: "Student deleted successfully"
    })
});

export const createTeacher = asyncHandler(async (req, res) => {
    const { name, email, password, department, maxStudents, expertise } = req.body;
    if (!name || !password || !email || !department || !maxStudents || !expertise) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }
    const user = await userServices.createUser({
        name,
        email,
        password,
        department,
        role: "Teacher",
        maxStudents,
        expertise: Array.isArray(expertise)
            ? expertise
            : typeof expertise === "string" && expertise.trim() !== ""
                ? expertise.split(",").map((s) => s.trim())
                : []
    });
    res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: { user }
    })
});

export const updateTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.role;

    const user = await userServices.updateUser(id, updateData);
    if (!user) {
        return res.status(404).json({ error: "Teacher not found" });
    }
    res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: { user }
    })
});

export const deleteTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userServices.getUserById(id);
    if (!user) {
        return res.status(404).json({ error: "Teacher not found" });
    }
    if (user.role !== "Teacher") {
        return res.status(400).json({ error: "User is not a Teacher" });
    }

    await userServices.deleteUser(id);
    res.status(200).json({
        success: true,
        message: "Teacher deleted successfully"
    })
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const { users } = await userServices.getAllUsers();
    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: { users }
    })
});