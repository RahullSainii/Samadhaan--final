const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Validation rules
const complaintValidation = [
  body('category')
    .isIn(['Technical', 'Billing', 'Service', 'Infrastructure', 'Other'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
];

const statusValidation = [
  body('status')
    .isIn(['Pending', 'In Progress', 'Resolved'])
    .withMessage('Invalid status'),
];

// Routes
router.post('/', authMiddleware, complaintValidation, complaintController.submitComplaint);
router.get('/my', authMiddleware, complaintController.getMyComplaints);
router.get('/', authMiddleware, complaintController.getComplaints);
router.get('/:id', authMiddleware, complaintController.getComplaintById);
router.patch('/:id/status', authMiddleware, adminMiddleware, statusValidation, complaintController.updateStatus);

module.exports = router;

