import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// Validate request and throw errors if any
export const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error(JSON.stringify({ errors: errors.array() }));
  }
};

// Register a new user
export const registerUser = async (username, password, role) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = new User({ username, password, role });
  await user.save();

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return {
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      profileCompleted: user.profileCompleted,
      verified: user.verified,
      verificationStatus: user.verificationStatus,
    },
  };
};

// Login a user and return a JWT token
export const loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return {
    message: 'Login successful',
    token,
    role: user.role,
    user: {
      id: user._id,
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
  };
};