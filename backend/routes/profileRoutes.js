const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('bio')
    .optional()
    .trim(),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

// Routes
router.get('/me', authMiddleware, profileController.getProfile);
router.put('/update', authMiddleware, updateProfileValidation, profileController.updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, profileController.changePassword);

module.exports = router;

