import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:
        allowedOrigins.length > 0
          ? allowedOrigins
          : ["http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", ({ userId }) => {
      if (!userId) return;
      const id = userId.toString();

      socket.join(id);
      onlineUsers.set(id, socket.id);

      console.log(`User ${id} joined room and is online.`);
      io.emit("userOnline", { userId: id }); 
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (receiverId) {
        io.to(receiverId.toString()).emit("typing", { senderId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      if (receiverId) {
        io.to(receiverId.toString()).emit("stopTyping", { senderId });
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUserId = null;

      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`User ${disconnectedUserId} went offline.`);
        io.emit("userOffline", {
          userId: disconnectedUserId,
          lastSeen: new Date(),
        });
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.io not initialized! Make sure initSocket(server) is called.",
    );
  }
  return io;
};
