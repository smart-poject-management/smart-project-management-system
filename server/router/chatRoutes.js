import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { saveMessage, getMessages, getChatHistory } from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", isAuthenticated, saveMessage);
router.get("/:senderId/:receiverId", isAuthenticated, getMessages);
router.get("/history/:receiverId", isAuthenticated, getChatHistory);

export default router;
