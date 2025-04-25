// utils/validators.js
import { body } from 'express-validator';

export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .trim()
    .escape(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['farmer', 'consumer', 'admin', 'retailer'])
    .withMessage('Role must be one of: farmer, consumer, admin, retailer'),
];

export const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .escape(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];