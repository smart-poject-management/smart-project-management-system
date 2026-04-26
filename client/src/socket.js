import { io } from "socket.io-client";

// Backend URL ko environment variable se lein, fallback to localhost
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const socket = io(SOCKET_URL, {
  autoConnect: false, // Page load hote hi connect nahi hoga, hum login par karenge
  withCredentials: true, // Cookies ya Auth headers ke liye zaroori hai
  transports: ["websocket"], // Faster performance ke liye directly websocket use karein
});

export default socket;
