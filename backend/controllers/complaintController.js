const Complaint = require('../models/Complaint');
const { validationResult } = require('express-validator');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private
exports.submitComplaint = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { category, description, priority } = req.body;

    const complaint = await Complaint.create({
      category,
      description,
      priority: priority || 'Medium',
      userId: req.user.id,
      date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all complaints (Admin) or user's complaints (User)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    const { category, priority, status, date, search } = req.query;
    const isAdmin = req.user.role === 'Admin';

    // Build query
    let query = {};

    // If user is not admin, only show their complaints
    if (!isAdmin) {
      query.userId = req.user.id;
    }

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Search in description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Format response to match frontend expectations
    const formattedComplaints = complaints.map((complaint, index) => ({
      id: `#${String(complaint._id.toString().slice(-3)).padStart(3, '0')}`,
      _id: complaint._id,
      category: complaint.category,
      description: complaint.description,
      priority: complaint.priority,
      status: complaint.status,
      date: complaint.date.toISOString().split('T')[0],
      userId: complaint.userId,
      createdAt: complaint.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      data: formattedComplaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user's own complaints
// @route   GET /api/complaints/my
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const { category, priority, status, date, search } = req.query;

    let query = { userId: req.user.id };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((complaint) => ({
      id: `#${String(complaint._id.toString().slice(-3)).padStart(3, '0')}`,
      _id: complaint._id,
      category: complaint.category,
      description: complaint.description,
      priority: complaint.priority,
      status: complaint.status,
      date: complaint.date.toISOString().split('T')[0],
      createdAt: complaint.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      data: formattedComplaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if user owns the complaint or is admin
    if (complaint.userId._id.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this complaint',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: `#${String(complaint._id.toString().slice(-3)).padStart(3, '0')}`,
        _id: complaint._id,
        category: complaint.category,
        description: complaint.description,
        priority: complaint.priority,
        status: complaint.status,
        date: complaint.date.toISOString().split('T')[0],
        userId: complaint.userId,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update complaint status (Admin only)
// @route   PATCH /api/complaints/:id/status
// @access  Private/Admin
exports.updateStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.status = status;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

