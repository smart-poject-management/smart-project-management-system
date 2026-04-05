import { User } from "../models/user.js";
import asyncHandler from "./asyncHandler.js";
import jwt from 'jsonwebtoken'

export const isAuthenticated = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ error: "Please login to access this resource." })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-resetPasswordToken -resetPasswordExpire");

    if (!req.user) {
        return res.status(404).json({ error: "User not found with this id." });
    }
    next();
});

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Role: ${req.user.role} is not allowed to access this resource`
            })
        }
        next();
    }
};