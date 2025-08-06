const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Partner = require('../models/Partner');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// User registration
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      verificationToken
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      type: 'user',
      role: user.role
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      type: 'user',
      role: user.role
    });

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Partner registration
const registerPartner = async (req, res) => {
  try {
    const {
      companyName,
      contactEmail,
      contactPhone,
      partnerType,
      address,
      businessRegistration,
      serviceAreas
    } = req.body;

    // Check if partner already exists
    const existingPartner = await Partner.findOne({ contactEmail });
    if (existingPartner) {
      return res.status(409).json({
        success: false,
        message: 'Partner already exists with this email'
      });
    }

    // Generate API credentials
    const apiKey = 'pk_' + crypto.randomBytes(16).toString('hex');
    const apiSecret = crypto.randomBytes(32).toString('hex');

    // Create new partner
    const partner = new Partner({
      companyName,
      contactEmail,
      contactPhone,
      partnerType,
      address,
      businessRegistration,
      serviceAreas,
      apiKey,
      apiSecret
    });

    await partner.save();

    logger.info(`New partner registered: ${companyName}`);

    res.status(201).json({
      success: true,
      message: 'Partner registered successfully',
      data: {
        partner: partner.toJSON(),
        credentials: {
          apiKey,
          apiSecret
        }
      }
    });
  } catch (error) {
    logger.error('Partner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Partner registration failed',
      error: error.message
    });
  }
};

// Partner login (get token using API credentials)
const loginPartner = async (req, res) => {
  try {
    const { apiKey, apiSecret } = req.body;

    // Find partner by API key
    const partner = await Partner.findOne({ apiKey, isActive: true }).select('+apiSecret');
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API credentials'
      });
    }

    // Check API secret
    if (partner.apiSecret !== apiSecret) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API credentials'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: partner._id,
      type: 'partner',
      companyName: partner.companyName
    });

    logger.info(`Partner logged in: ${partner.companyName}`);

    res.json({
      success: true,
      message: 'Partner login successful',
      data: {
        partner: partner.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error('Partner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Partner login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    if (req.user) {
      res.json({
        success: true,
        data: {
          user: req.user,
          type: 'user'
        }
      });
    } else if (req.partner) {
      res.json({
        success: true,
        data: {
          partner: req.partner,
          type: 'partner'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Generate new token
    const newToken = generateToken({
      id: decoded.id,
      type: decoded.type,
      role: decoded.role,
      companyName: decoded.companyName
    });

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerPartner,
  loginPartner,
  getProfile,
  refreshToken
};
