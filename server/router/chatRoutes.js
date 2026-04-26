import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📩 Message bhejne ke liye (POST: /api/chat/send)
// isAuthenticated check karega ki user logged in hai ya nahi
router.post("/send", isAuthenticated, sendMessage);

// 📂 Particular student/teacher ke sath messages get karne ke liye (GET: /api/chat/:receiverId)
router.get("/:receiverId", isAuthenticated, getMessages);

export default router;
