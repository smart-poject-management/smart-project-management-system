import dotenv from "dotenv";
dotenv.config(); 

import { connectDb } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket/socket.js";

const startServer = async () => {
  try {
    await connectDb();

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    initSocket(server);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
