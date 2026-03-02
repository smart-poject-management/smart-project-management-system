import { User } from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import ErrorHandler from "../middlewares/error.js";

export const registerUserService = async (userData) => {
    const { name, email, password, role } = userData;
    if (!name || !email || !password || !role) {
        throw new ErrorHandler(400, "Please provide name, email, password and role");
    }

    let user = await User.findOne({ email });
    if (user) {
        throw new ErrorHandler(400, "User already exists");
    }

    user = new User({ name, email, password, role });
    await user.save();
    return user;
};

export const loginService = async (loginData) => {
    const { email, password, role } = loginData;
    if (!email || !password || !role) {
        throw new ErrorHandler(400, "Please provide email, password and role");
    }

    const user = await User.findOne({ email, role }).select("+password");
    if (!user) {
        throw new ErrorHandler(400, "Invalid credentials");
    }

    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
        throw new ErrorHandler(400, "Invalid credentials");
    }

    return user;
};

export const forgotPasswordService = async (email) => {
    if (!email) {
        throw new ErrorHandler(400, "Please provide an email");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorHandler(404, "User not found with this email");
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a request to: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Recovery",
            message,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ErrorHandler(500, "Email could not be sent");
    }
};

export const resetPasswordService = async (token, passwords) => {
    const { password, confirmPassword } = passwords;

    if (password !== confirmPassword) {
        throw new ErrorHandler(400, "Passwords do not match");
    }

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new ErrorHandler(400, "Reset Password Token is invalid or has expired");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return user;
};
