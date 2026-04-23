import { connectDb } from "./config/db.js";
import app from "./app.js";
import { Server } from "socket.io";
import Message from "./models/Chat.js";

await connectDb();

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ userId }) => {
    if (!userId) return;

    socket.join(userId.toString());
    onlineUsers.set(userId.toString(), socket.id);

    socket.broadcast.emit("userOnline", { userId });

    console.log("User joined:", userId);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    if (!senderId || !receiverId || !message) return;

    try {
      const newMsg = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text: message,
      });

      const payload = {
        _id: newMsg._id,
        senderId,
        receiverId,
        message,
        createdAt: newMsg.createdAt,
      };

      io.to(receiverId.toString()).emit("receiveMessage", payload);
      io.to(senderId.toString()).emit("receiveMessage", payload);
    } catch (error) {
      console.error("Message save error:", error);
    }
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("typing", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("stopTyping", { senderId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    let disconnectedUser = null;

    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        disconnectedUser = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUser) {
      io.emit("userOffline", {
        userId: disconnectedUser,
        lastSeen: new Date(),
      });
    }
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  server.close(() => {
    process.exit(1);
  });
});
