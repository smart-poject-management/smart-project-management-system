import { connectDb } from './config/db.js';
import app from './app.js';


//database connection

connectDb();

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    server.close(() => {
        process.exit(1);
    });
});