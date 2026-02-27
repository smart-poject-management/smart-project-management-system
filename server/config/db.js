import mongoose from 'mongoose';
import { config } from 'dotenv';        

export const connectDb = async () => {  
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    }); 
}