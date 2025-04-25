import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import verificationRoutes from './routes/verification.js';
import productRoutes from './routes/product.js';
import blockchainRoutes from './routes/blockchain.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

// Enable CORS for the frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/verifications', verificationRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/blockchain', blockchainRoutes);

    // Start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));
  })
  .catch(err => {
    console.error('Failed to start server due to database connection error:', err);
    process.exit(1);
  });