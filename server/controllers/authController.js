import { asyncHandler } from "../middlewares/asyncHandler.js";
import { User } from "../models/user.js";
import { generateToken } from "../utils/generateToken.js";

//register user

export const registerUser = asyncHandler(async (req, res) => {
  const {name, email, password, role } = req.body;
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

export const login = asyncHandler(async (req, res, next) => {
    const { email, password , role } = req.body;
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
export const getUser = asyncHandler(async (req, res, next) => {});
export const logout = asyncHandler(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      }).json({ success: true, message: "User logged out successfully" });  
});
export const forgotPassword = asyncHandler(async (req, res, next) => {});
export const resetPassword = asyncHandler(async (req, res, next) => {});
