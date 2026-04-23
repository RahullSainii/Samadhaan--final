const Complaint = require('../models/Complaint');
const { validationResult } = require('express-validator');
const { analyzeComplaintSubmission } = require('../utils/complaintFraudDetector');

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024; // 2MB

const normalizeAttachments = (attachments) => {
  if (!attachments) return [];
  if (!Array.isArray(attachments)) {
    throw new Error('Attachments must be an array');
  }
  if (attachments.length > MAX_ATTACHMENTS) {
    throw new Error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
  }

  return attachments.map((att, index) => {
    if (!att || typeof att.data !== 'string') {
      throw new Error(`Invalid attachment at position ${index + 1}`);
    }

    let type = typeof att.type === 'string' ? att.type : '';
    let dataUri = att.data;
    let base64 = att.data;

    if (dataUri.startsWith('data:')) {
      const match = dataUri.match(/^data:(.+);base64,(.*)$/);
      if (!match) {
        throw new Error(`Invalid attachment data at position ${index + 1}`);
      }
      type = type || match[1];
      base64 = match[2];
      dataUri = `data:${type};base64,${base64}`;
    } else {
      if (!type) {
        throw new Error(`Attachment type is required at position ${index + 1}`);
      }
      dataUri = `data:${type};base64,${base64}`;
    }

    if (!type.startsWith('image/')) {
      throw new Error(`Attachment ${index + 1} must be an image`);
    }

    const size = Buffer.from(base64, 'base64').length;
    if (size > MAX_ATTACHMENT_SIZE) {
      throw new Error(`Attachment ${index + 1} exceeds 2MB`);
    }

    return {
      name: att.name || `attachment_${index + 1}`,
      type,
      size,
      data: dataUri,
    };
  });
};

const formatComplaint = (complaint, viewerRole) => {
  const isAnonymous = Boolean(complaint.isAnonymous);
  const base = {
    id: `#${String(complaint._id.toString().slice(-3)).padStart(3, '0')}`,
    _id: complaint._id,
    category: complaint.category,
    description: complaint.description,
    priority: complaint.priority,
    status: complaint.status,
    date: complaint.date.toISOString().split('T')[0],
    createdAt: complaint.createdAt,
    location: complaint.location || '',
    isAnonymous,
    handledBy: complaint.handledBy || '',
    attachmentCount: complaint.attachments ? complaint.attachments.length : 0,
    moderation: complaint.moderation
      ? {
          status: complaint.moderation.status || 'clean',
          spamScore: complaint.moderation.spamScore || 0,
          abusiveScore: complaint.moderation.abusiveScore || 0,
          duplicateScore: complaint.moderation.duplicateScore || 0,
          reasons: complaint.moderation.reasons || [],
          duplicateComplaintIds: complaint.moderation.duplicateComplaintIds || [],
          detectedAt: complaint.moderation.detectedAt || null,
        }
      : {
          status: 'clean',
          spamScore: 0,
          abusiveScore: 0,
          duplicateScore: 0,
          reasons: [],
          duplicateComplaintIds: [],
          detectedAt: null,
        },
  };

  if (viewerRole === 'Admin') {
    if (isAnonymous) {
      return {
        ...base,
        userId: null,
        reportedBy: 'Anonymous',
      };
    }

    return {
      ...base,
      userId: complaint.userId,
      reportedBy: complaint.userId
        ? `${complaint.userId.name || 'User'}${complaint.userId.email ? ` (${complaint.userId.email})` : ''}`
        : 'User',
    };
  }

  return {
    ...base,
    userId: complaint.userId,
  };
};

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

    const { category, description, priority, attachments, location, isAnonymous } = req.body;

    let normalizedAttachments = [];
    try {
      normalizedAttachments = normalizeAttachments(attachments);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid attachments',
      });
    }

    const recentComplaints = await Complaint.find({
      userId: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .select('_id category description location createdAt')
      .sort({ createdAt: -1 })
      .limit(15);

    const moderation = analyzeComplaintSubmission({
      category,
      description,
      location,
      attachments: normalizedAttachments,
      recentComplaints,
    });

    if (moderation.status === 'blocked') {
      return res.status(422).json({
        success: false,
        message: 'Complaint blocked by AI fraud/spam filter. Please revise and resubmit.',
        moderation,
      });
    }

    const complaint = await Complaint.create({
      category,
      description,
      priority: priority || 'Medium',
      userId: req.user.id,
      date: new Date(),
      attachments: normalizedAttachments,
      location: location || '',
      isAnonymous: Boolean(isAnonymous),
      moderation,
    });

    res.status(201).json({
      success: true,
      message:
        moderation.status === 'flagged'
          ? 'Complaint submitted and flagged for review'
          : 'Complaint submitted successfully',
      data: formatComplaint(complaint, req.user.role),
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
    const formattedComplaints = complaints.map((complaint) =>
      formatComplaint(complaint, req.user.role)
    );

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

    const formattedComplaints = complaints.map((complaint) =>
      formatComplaint(complaint, req.user.role)
    );

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

    const formatted = formatComplaint(complaint, req.user.role);
    res.status(200).json({
      success: true,
      data: {
        ...formatted,
        attachments: complaint.attachments || [],
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

    const { status, handledBy } = req.body;

    if (!status && !handledBy) {
      return res.status(400).json({
        success: false,
        message: 'Status or handledBy must be provided',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (status) {
      complaint.status = status;
    }
    if (handledBy !== undefined) {
      complaint.handledBy = handledBy;
    }
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: formatComplaint(complaint, req.user.role),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};


