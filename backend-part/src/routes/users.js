const express = require('express');
const router = express.Router();
const User = require('../models/User');
const NotificationService = require('../services/notificationService');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, notificationSubscriptionSchema } = require('../middleware/validation');
const logger = require('../utils/logger');

// Get current user profile
router.get('/me', authenticateToken, authorize('customer', 'admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, authorize('customer', 'admin'), async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Subscribe to notifications for a shipment
router.post('/me/subscriptions', 
  authenticateToken, 
  authorize('customer', 'admin'),
  validate(notificationSubscriptionSchema),
  async (req, res) => {
    try {
      const { trackingNumber, email, phone, preferences } = req.body;

      await NotificationService.subscribeToNotifications(
        req.user._id,
        trackingNumber,
        preferences
      );

      logger.info(`User ${req.user.email} subscribed to notifications for ${trackingNumber}`);

      res.json({
        success: true,
        message: 'Successfully subscribed to notifications'
      });
    } catch (error) {
      logger.error('Subscribe to notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe to notifications',
        error: error.message
      });
    }
  }
);

// Get user's notification preferences
router.get('/me/preferences', authenticateToken, authorize('customer', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');

    res.json({
      success: true,
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
});

// Update user's notification preferences
router.put('/me/preferences', authenticateToken, authorize('customer', 'admin'), async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, runValidators: true }
    );

    logger.info(`User preferences updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

// Get notification history for user
router.get('/me/notifications', authenticateToken, authorize('customer', 'admin'), async (req, res) => {
  try {
    const { trackingNumber } = req.query;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    const notifications = await NotificationService.getNotificationHistory(trackingNumber);

    res.json({
      success: true,
      data: {
        notifications
      }
    });
  } catch (error) {
    logger.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification history',
      error: error.message
    });
  }
});

// Delete user account
router.delete('/me', authenticateToken, authorize('customer'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    logger.info(`User account deleted: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

module.exports = router;
