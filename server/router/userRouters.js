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
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
router.get("/logout", logout);

export default router;  
