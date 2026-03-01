import { generateToken } from "../utils/generateToken.js";
import * as authService from "../services/authService.js";

// @desc    Register user
// @route   POST /api/v1/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const user = await authService.registerUserService(req.body);
    generateToken(user, 201, "User registered successfully", res);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const user = await authService.loginService(req.body);
    generateToken(user, 200, "User logged in successfully", res);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
export const getUser = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
export const logout = async (req, res, next) => {
  try {
    res.status(200).cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    }).json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPasswordService(req.body.email);
    res.status(200).json({
      success: true,
      message: `Email sent to: ${req.body.email}`,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/password/reset/:token
export const resetPassword = async (req, res, next) => {
  try {
    const user = await authService.resetPasswordService(req.params.token, req.body);
    generateToken(user, 200, "Password updated successfully", res);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
