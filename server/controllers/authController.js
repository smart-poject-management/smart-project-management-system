import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import { seedAdmin } from "../utils/seedAdmin.js";
import crypto from "crypto";

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, password and role",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || user.role !== role) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isPassword = await user.matchPassword(password);

  if (!isPassword) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  generateToken(user, 200, "User logged in successfully", res);
});

export const getUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with this email",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      to: user.email,
      subject: "FYP SYSTEM - 🔒 Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: error.message || "Cannot send email",
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired password reset token",
    });
  }

  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password and confirm password do not match",
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, 200, "Password reset successfully", res);
});
