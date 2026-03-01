import express from "express";
import {
  registerUser,
  getUser,
  forgotPassword,
  login,
  logout,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/me", getUser);
router.post("/forgot-password", forgotPassword);
router.post("/password/reset/:token", resetPassword);
router.post("/logout", logout);

export default router;  
