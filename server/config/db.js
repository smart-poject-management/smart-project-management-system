import mongoose from 'mongoose';
import { seedAdmin } from '../utils/seedAdmin.js';

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        await seedAdmin();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}