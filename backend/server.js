import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js'; // Add user routes
import productRoutes from './routes/product.js'; // Add product routes
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes); // Add user routes
    app.use('/api/products', productRoutes); // Add product routes

    // Start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));
  })
  .catch(err => {
    console.error('Failed to start server due to database connection error:', err);
    process.exit(1);
  });