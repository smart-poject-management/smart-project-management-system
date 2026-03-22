import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './router/userRouters.js';
import adminRoutes from './router/adminRoutes.js';
import studentRoutes from './router/studentRoutes.js';
import notificationRoutes from './router/notificationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { setServers } from 'node:dns/promises';
setServers(['1.1.1.1', '8.8.8.8']);
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const uploadsDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", userRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notification", notificationRoutes)

app.use(errorMiddleware);

export default app;
