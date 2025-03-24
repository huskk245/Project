import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { registerValidation, loginValidation } from '../utils/validators.js';
import { validateRequest, registerUser, loginUser } from '../utils/authUtils.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 1234567890-123.jpg
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

const router = express.Router();

// Register a new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    validateRequest(req);
    const { username, password, role } = req.body;
    const result = await registerUser(username, password, role);
    res.status(201).json(result);
  } catch (error) {
    let errorMessage;
    try {
      errorMessage = JSON.parse(error.message);
    } catch (parseError) {
      errorMessage = null;
    }

    if (errorMessage && errorMessage.errors) {
      res.status(400).json(errorMessage);
    } else {
      res.status(error.message === 'User already exists' ? 400 : 500).json({ message: error.message });
    }
  }
});

// Login a user
router.post('/login', loginValidation, async (req, res) => {
  try {
    validateRequest(req);
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    res.json(result);
  } catch (error) {
    let errorMessage;
    try {
      errorMessage = JSON.parse(error.message);
    } catch (parseError) {
      errorMessage = null;
    }

    if (errorMessage && errorMessage.errors) {
      res.status(400).json(errorMessage);
    } else {
      res.status(error.message === 'Invalid credentials' ? 400 : 500).json({ message: error.message });
    }
  }
});

// Complete profile (farmer only)
router.put('/complete-profile', authMiddleware, roleMiddleware(['farmer']), upload.single('photo'), async (req, res) => {
  try {
    const { phoneNumber, dob, address, farmSize } = req.body;

    // Validate required fields
    if (!phoneNumber || !dob || !address || !farmSize) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profileCompleted) {
      return res.status(400).json({ message: 'Profile already completed' });
    }

    // Update user profile
    user.phoneNumber = phoneNumber;
    user.dob = dob;
    user.address = address;
    user.farmSize = farmSize;
    user.photo = `/uploads/${req.file.filename}`; // Store the relative path to the photo
    user.profileCompleted = true;
    user.verificationStatus = 'pending'; // Set verification status to pending

    await user.save();

    res.json({
      message: 'Profile completed successfully. Verification pending admin approval.',
      user: {
        username: user.username,
        role: user.role,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        address: user.address,
        farmSize: user.farmSize,
        photo: user.photo,
        profileCompleted: user.profileCompleted,
        verified: user.verified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout (protected route, allow all roles)
router.post('/logout', authMiddleware, roleMiddleware(['admin', 'farmer', 'consumer']), (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;