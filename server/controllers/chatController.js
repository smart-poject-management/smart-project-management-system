import { Message } from "../models/Message.js";
import { getIO } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message text are required",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: text.trim(), 
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    const io = getIO();
    io.to(receiverId.toString()).emit("newMessage", populatedMessage);

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 }) 
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
