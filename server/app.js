import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './router/userRouters.js';

config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", userRouter);


app.use(errorMiddleware);

export default app;
