/**
 * Authentication Routes
 *
 * POST /api/auth/register — Create a new user (restricted to @petasight.com)
 * POST /api/auth/login    — Authenticate and return JWT
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { User, ALLOWED_EMAIL_DOMAIN } = require('../models/User');
const { config } = require('../config/env');

const router = express.Router();

const TOKEN_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.',
      });
    }

    // Strict domain check
    if (!email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
      return res.status(403).json({
        success: false,
        error: `Registration is restricted to ${ALLOWED_EMAIL_DOMAIN} email addresses.`,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists.',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
      });
    }

    const user = new User({ name, email: email.toLowerCase(), password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join('. '),
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during registration.',
    });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account does not exist. Please create an account first.',
        code: 'ACCOUNT_NOT_FOUND'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login.',
    });
  }
});

module.exports = router;
