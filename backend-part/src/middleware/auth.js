const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'user') {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      req.user = user;
    } else if (decoded.type === 'partner') {
      const partner = await Partner.findById(decoded.id);
      if (!partner || !partner.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Partner not found or inactive'
        });
      }
      req.partner = partner;
    }

    req.tokenData = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Authenticate API key for partners
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    const partner = await Partner.findOne({ apiKey, isActive: true });
    
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    req.partner = partner;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API key verification failed'
    });
  }
};

// Authorization middleware for roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    
    if (req.partner && roles.includes('partner')) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      message: 'Insufficient permissions'
    });
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type === 'user') {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          req.tokenData = decoded;
        }
      }
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateApiKey,
  authorize,
  optionalAuth
};
