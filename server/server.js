import dotenv from "dotenv";
dotenv.config(); // Environment variables load karne ke liye zaroori hai

import { connectDb } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket/socket.js";

const startServer = async () => {
  try {
    // 1. Database Connection
    await connectDb();
    console.log("✅ Database connected successfully");

    const PORT = process.env.PORT || 5000;

    // 2. Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // 3. Initialize Socket.io with the HTTP server
    initSocket(server);
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Error aane par process band kar dein
  }
};

startServer();
