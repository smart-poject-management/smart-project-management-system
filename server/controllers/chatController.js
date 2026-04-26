import { Message } from "../models/Message.js";
import { getIO } from "../socket/socket.js";

// ✅ SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text } = req.body; // Frontend se 'text' aa raha hai

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message text are required",
      });
    }

    // 💾 SAVE TO DATABASE
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: text.trim(), // Yahan 'text' ko 'content' mein save kar rahe hain
    });

    // 🔄 POPULATE DATA (Frontend display ke liye)
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    // 🔥 SOCKET REALTIME EMIT
    const io = getIO();
    // Receiver ke personal room mein message bhejna
    io.to(receiverId.toString()).emit("newMessage", populatedMessage);

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("❌ SEND MESSAGE ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ GET ALL MESSAGES (Between two users)
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
      .sort({ createdAt: 1 }) // Purane message upar, naye niche
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("❌ GET MESSAGES ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
