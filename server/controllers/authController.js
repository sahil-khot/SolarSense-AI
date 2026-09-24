const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to get JWT Secret securely
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'solarsense_jwt_secret');
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return secret;
};

// Helper to generate signed JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

// @desc    Register a new standard user with username, email, password & confirm password
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, name, email, password, confirmPassword, phone, location, userType } = req.body;

    // 1. Username validation
    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        field: 'username',
        message: 'Please provide a username.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        field: 'username',
        message: 'Username must be at least 3 characters.',
      });
    }
    if (cleanUsername.length > 30) {
      return res.status(400).json({
        success: false,
        field: 'username',
        message: 'Username cannot exceed 30 characters.',
      });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        field: 'username',
        message: 'Username can contain letters, numbers and underscores only (no spaces).',
      });
    }

    // 2. Email validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please provide an email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please enter a valid email address.',
      });
    }

    // 3. Password validation
    if (!password) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Please provide a password.',
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must be at least 8 characters long.',
      });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must contain at least one uppercase letter.',
      });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must contain at least one lowercase letter.',
      });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must contain at least one number.',
      });
    }

    // 4. Confirm Password validation
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        field: 'confirmPassword',
        message: 'Passwords do not match.',
      });
    }

    // 5. Check duplicate username in DB
    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        field: 'username',
        message: 'This username is already taken. Please choose another.',
      });
    }

    // 6. Check duplicate email in DB
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'This email address is already registered. Please log in instead.',
      });
    }

    // 7. Create user with hashed password (hashed in pre-save hook)
    const displayName = name && name.trim() ? name.trim() : username.trim();
    const user = await User.create({
      username: cleanUsername,
      name: displayName,
      email: cleanEmail,
      password,
      phone: phone || '',
      location: location || { state: 'Maharashtra', city: 'Pune' },
      userType: userType || 'residential',
      role: 'user',
      authProvider: 'local',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        userType: user.userType,
        role: user.role,
        authProvider: user.authProvider,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      if (error.keyPattern?.username) {
        return res.status(400).json({
          success: false,
          field: 'username',
          message: 'This username is already taken. Please choose another.',
        });
      }
      if (error.keyPattern?.email) {
        return res.status(400).json({
          success: false,
          field: 'email',
          message: 'This email address is already registered. Please log in instead.',
        });
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// @desc    Check username availability in real-time
// @route   GET /api/auth/check-username
// @access  Public
const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || !username.trim()) {
      return res.status(400).json({ available: false, message: 'Please enter a username.' });
    }

    const clean = username.trim().toLowerCase();
    if (clean.length < 3) {
      return res.json({ available: false, message: 'Username must be at least 3 characters.' });
    }
    if (clean.length > 30) {
      return res.json({ available: false, message: 'Username cannot exceed 30 characters.' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return res.json({ available: false, message: 'Letters, numbers and underscores only (no spaces).' });
    }

    const existing = await User.findOne({ username: clean });
    if (existing) {
      return res.json({ available: false, message: 'This username is already taken. Please choose another.' });
    }

    return res.json({ available: true, message: 'Username available' });
  } catch (err) {
    res.status(500).json({ available: false, message: 'Error verifying username.' });
  }
};

// @desc    Check email availability in real-time
// @route   GET /api/auth/check-email
// @access  Public
const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || !email.trim()) {
      return res.status(400).json({ available: false, message: 'Please enter an email address.' });
    }

    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return res.json({ available: false, message: 'Please enter a valid email address.' });
    }

    const existing = await User.findOne({ email: clean });
    if (existing) {
      return res.json({ available: false, message: 'This email address is already registered. Please log in instead.' });
    }

    return res.json({ available: true, message: 'Valid email' });
  } catch (err) {
    res.status(500).json({ available: false, message: 'Error verifying email.' });
  }
};

// @desc    Authenticate standard user by Username OR Email & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const rawId = (identifier || email || username || '').trim();

    if (!rawId) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your username or email.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.',
      });
    }

    // Resolve whether input is email or username
    const cleanId = rawId.toLowerCase();
    const isEmail = cleanId.includes('@');

    if (isEmail) {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!EMAIL_REGEX.test(cleanId)) {
        return res.status(400).json({
          success: false,
          field: 'identifier',
          message: 'Please enter a valid email address.',
        });
      }
    } else {
      if (cleanId.length < 3 || !/^[a-zA-Z0-9_]{3,30}$/.test(cleanId)) {
        return res.status(400).json({
          success: false,
          field: 'identifier',
          message: 'Invalid username format.',
        });
      }
    }

    const query = isEmail
      ? { email: cleanId }
      : { $or: [{ username: cleanId }, { email: cleanId }] };

    const user = await User.findOne(query).select('+password');

    // Generic error to prevent account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect username/email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect username/email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        userType: user.userType,
        role: user.role,
        authProvider: user.authProvider,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

// @desc    Separate Admin Login
// @route   POST /api/auth/admin/login
// @access  Public (Strict Role Verification)
const loginAdmin = async (req, res) => {
  try {
    const { email, identifier, username, password } = req.body;
    const rawId = (email || identifier || username || '').trim().toLowerCase();

    if (!rawId) {
      return res.status(400).json({
        success: false,
        field: 'identifier',
        message: 'Please enter admin username or email.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Please enter your password.',
      });
    }

    const isEmail = rawId.includes('@');
    if (isEmail) {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!EMAIL_REGEX.test(rawId)) {
        return res.status(400).json({
          success: false,
          field: 'identifier',
          message: 'Please enter a valid email address.',
        });
      }
    } else {
      if (rawId.length < 3 || !/^[a-zA-Z0-9_]{3,30}$/.test(rawId)) {
        return res.status(400).json({
          success: false,
          field: 'identifier',
          message: 'Invalid username format.',
        });
      }
    }

    const query = isEmail
      ? { email: rawId }
      : { $or: [{ username: rawId }, { email: rawId }] };

    const adminUser = await User.findOne(query).select('+password');
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    if (adminUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.',
      });
    }

    const isMatch = await adminUser.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.',
      });
    }

    const token = generateToken(adminUser._id, adminUser.role);

    res.json({
      success: true,
      message: 'Admin authorization granted.',
      token,
      user: {
        id: adminUser._id,
        username: adminUser.username,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin authentication.',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
    });
  }
};

// @desc    Initiate password recovery with secure token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Secure password reset token generated successfully. Valid for 15 minutes.',
      resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using secure token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Password successfully updated. You are now logged in.',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  checkUsername,
  checkEmail,
  loginUser,
  loginAdmin,
  getMe,
  forgotPassword,
  resetPassword,
};
