// utils/authUtils.js
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
  return { message: 'User registered successfully' };
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

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token };
};