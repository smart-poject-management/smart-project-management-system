import Chat from "../models/Chat.js";

// Save message
export const saveMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const chat = await Chat.create({ sender, receiver, message });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat history
export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Chat.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  const { userId } = req.user;
  const { receiverId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: receiverId },
      { sender: receiverId, receiver: userId },
    ],
  }).sort({ createdAt: 1 });

  res.json({
    success: true,
    data: { messages },
  });
};
