// routes/auth.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { registerValidation, loginValidation } from '../utils/validators.js';
import { validateRequest, registerUser, loginUser } from '../utils/authUtils.js';

const router = express.Router();

// Register a new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    validateRequest(req);
    const { username, password, role } = req.body;
    const result = await registerUser(username, password, role);
    res.status(201).json(result);
  } catch (error) {
    // Check if the error is a validation error (from validateRequest)
    let errorMessage;
    try {
      errorMessage = JSON.parse(error.message);
    } catch (parseError) {
      // If parsing fails, it's not a validation error, so use the raw message
      errorMessage = null;
    }

    if (errorMessage && errorMessage.errors) {
      // Validation error
      res.status(400).json(errorMessage);
    } else {
      // Business logic error (e.g., "User already exists") or other error
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
    // Check if the error is a validation error (from validateRequest)
    let errorMessage;
    try {
      errorMessage = JSON.parse(error.message);
    } catch (parseError) {
      // If parsing fails, it's not a validation error, so use the raw message
      errorMessage = null;
    }

    if (errorMessage && errorMessage.errors) {
      // Validation error
      res.status(400).json(errorMessage);
    } else {
      // Business logic error (e.g., "Invalid credentials") or other error
      res.status(error.message === 'Invalid credentials' ? 400 : 500).json({ message: error.message });
    }
  }
});

// Logout (protected route, allow all roles)
router.post('/logout', authMiddleware, roleMiddleware(['admin', 'farmer', 'consumer']), (req, res) => {
  // Since we're not using Redis, logout is handled client-side by deleting the token
  res.json({ message: 'Logged out successfully' });
});

export default router;