import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from 'crypto';

//register user

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Please provide name, email, password and role" });
  }
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "User already exists" });
  }
  user = new User({ name, email, password, role });
  await user.save();
  generateToken(user, 201, "User registered successfully", res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Please provide email, password and role" });
  }
  const user = await User.findOne({ email, role }).select("+password");
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const isPassword = await user.matchPassword(password);
  if (!isPassword) {
    return res.status(400).json({ error: "Invalid credentials password is incorrect" });
  }
  generateToken(user, 200, "User logged in successfully", res);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json({ success: true, user })
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({ success: true, message: "User logged out successfully" });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ error: "User not found with this email" });
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      to: user.email,
      subject: "FYP SYSTEM - 🔒 Password Reset Request",
      message
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ error: error.message || "Can not send email" });
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  if (!user) {
    return res.status(400).json({
      error: "Invalid or expired password reset token"
    })
  };

  if (!req.body.password || !req.body.confirmPassword) {
    return res.status(400).json({ error: "Please provide all required fields" })
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ error: "Password and Confirm password do not match" })
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  generateToken(user, 200, "Password reset successful", res)
});
