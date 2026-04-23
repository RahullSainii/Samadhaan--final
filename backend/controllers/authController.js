const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

// Generate JWT Token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
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

    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'User',
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
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

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken: token });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      const accessToken = generateAccessToken(user._id);
      res.status(200).json({
        success: true,
        accessToken,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during token refresh',
    });
  }
};

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during logout',
    });
  }
};

// @desc    Request password reset pin
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset PIN has been sent.',
      });
    }

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex');
    user.resetPinHash = pinHash;
    user.resetPinExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const subject = 'Samadhaan Password Reset PIN';
    const text = `Your Samadhaan password reset PIN is ${pin}. It expires in 10 minutes.`;
    const html = `<p>Your Samadhaan password reset PIN is <strong>${pin}</strong>.</p><p>It expires in 10 minutes.</p>`;

    await sendEmail({ to: user.email, subject, text, html });

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset PIN has been sent.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during password reset',
    });
  }
};

// @desc    Reset password using PIN
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, pin, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !user.resetPinHash || !user.resetPinExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset PIN',
      });
    }

    if (user.resetPinExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset PIN has expired',
      });
    }

    const pinHash = crypto.createHash('sha256').update(String(pin)).digest('hex');
    if (pinHash !== user.resetPinHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset PIN',
      });
    }

    user.password = newPassword;
    user.resetPinHash = undefined;
    user.resetPinExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login again.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during password reset',
    });
  }
};


