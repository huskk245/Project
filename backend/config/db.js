// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    // Log the connection string for debugging (remove in production)
    console.log('Connecting to MongoDB at:', process.env.MONGO_URI);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI); // Remove all deprecated options

    console.log('MongoDB connected successfully ✅');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit the process if the connection fails
  }
};

// Export the connectDB function
export default connectDB;