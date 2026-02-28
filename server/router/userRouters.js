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
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.get("/logout", logout);

export default router;  
