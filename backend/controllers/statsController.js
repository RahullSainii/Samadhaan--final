const Complaint = require('../models/Complaint');

// @desc    Get total complaints count
// @route   GET /api/stats/total
// @access  Private/Admin
exports.getTotalComplaints = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    res.status(200).json({
      success: true,
      data: { total },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get pending complaints count
// @route   GET /api/stats/pending
// @access  Private/Admin
exports.getPendingComplaints = async (req, res) => {
  try {
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    res.status(200).json({
      success: true,
      data: { pending },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get resolved complaints count
// @route   GET /api/stats/resolved
// @access  Private/Admin
exports.getResolvedComplaints = async (req, res) => {
  try {
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    res.status(200).json({
      success: true,
      data: { resolved },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get category distribution
// @route   GET /api/stats/category-distribution
// @access  Private/Admin
exports.getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Format for Chart.js
    const labels = distribution.map(item => item._id);
    const data = distribution.map(item => item.count);

    res.status(200).json({
      success: true,
      data: {
        labels,
        datasets: [{
          label: 'Complaints',
          data,
        }],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get status distribution
// @route   GET /api/stats/status-distribution
// @access  Private/Admin
exports.getStatusDistribution = async (req, res) => {
  try {
    const distribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format for Chart.js doughnut chart
    const labels = distribution.map(item => item._id);
    const data = distribution.map(item => item.count);

    res.status(200).json({
      success: true,
      data: {
        labels,
        datasets: [{
          data,
        }],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all statistics at once
// @route   GET /api/stats/all
// @access  Private/Admin
exports.getAllStats = async (req, res) => {
  try {
    const [total, pending, resolved, categoryDist, statusDist] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      Complaint.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        resolved,
        categoryDistribution: {
          labels: categoryDist.map(item => item._id),
          data: categoryDist.map(item => item.count),
        },
        statusDistribution: {
          labels: statusDist.map(item => item._id),
          data: statusDist.map(item => item.count),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

