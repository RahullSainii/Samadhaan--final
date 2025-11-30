const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All stats routes require admin access
router.get('/total', authMiddleware, adminMiddleware, statsController.getTotalComplaints);
router.get('/pending', authMiddleware, adminMiddleware, statsController.getPendingComplaints);
router.get('/resolved', authMiddleware, adminMiddleware, statsController.getResolvedComplaints);
router.get('/category-distribution', authMiddleware, adminMiddleware, statsController.getCategoryDistribution);
router.get('/status-distribution', authMiddleware, adminMiddleware, statsController.getStatusDistribution);
router.get('/all', authMiddleware, adminMiddleware, statsController.getAllStats);

module.exports = router;

