const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, notificationSubscriptionSchema } = require('../middleware/validation');
const logger = require('../utils/logger');

// Subscribe to notifications for a shipment (public endpoint)
router.post('/subscribe', validate(notificationSubscriptionSchema), async (req, res) => {
  try {
    const { trackingNumber, email, phone, preferences } = req.body;

    // Create subscription notification record
    const notification = new Notification({
      trackingNumber,
      type: 'email',
      event: 'subscription',
      recipient: { email, phone },
      status: 'pending',
      message: `Subscribed to notifications for tracking number: ${trackingNumber}`
    });

    await notification.save();

    logger.info(`Subscription created for tracking number: ${trackingNumber}`);

    res.json({
      success: true,
      message: 'Successfully subscribed to notifications',
      data: {
        trackingNumber,
        preferences
      }
    });
  } catch (error) {
    logger.error('Subscribe to notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to notifications',
      error: error.message
    });
  }
});

// Get notification history for a tracking number
router.get('/history/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const notifications = await NotificationService.getNotificationHistory(trackingNumber);

    res.json({
      success: true,
      data: {
        trackingNumber,
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

// Send manual notification (partner only)
router.post('/send', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const { trackingNumber, type, recipient, subject, message } = req.body;

    const notification = new Notification({
      trackingNumber,
      type,
      event: 'manual',
      recipient,
      subject,
      message,
      status: 'pending'
    });

    await notification.save();
    await NotificationService.processNotification(notification);

    logger.info(`Manual notification sent for tracking number: ${trackingNumber}`);

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        notification
      }
    });
  } catch (error) {
    logger.error('Send manual notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// Get notification statistics (partner)
router.get('/stats', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    const [statusStats, typeStats, totalNotifications] = await Promise.all([
      Notification.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Notification.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]),
      Notification.countDocuments(matchQuery)
    ]);

    const statusBreakdown = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const typeBreakdown = typeStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Calculate success rate
    const sentCount = statusBreakdown.sent || 0;
    const successRate = totalNotifications > 0 ? (sentCount / totalNotifications * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalNotifications,
        statusBreakdown,
        typeBreakdown,
        successRate: parseFloat(successRate),
        period: {
          startDate: startDate || 'all time',
          endDate: endDate || 'present'
        }
      }
    });
  } catch (error) {
    logger.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics',
      error: error.message
    });
  }
});

// Get failed notifications (partner)
router.get('/failed', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const failedNotifications = await Notification.paginate(
      { status: 'failed' },
      options
    );

    res.json({
      success: true,
      data: failedNotifications
    });
  } catch (error) {
    logger.error('Get failed notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get failed notifications',
      error: error.message
    });
  }
});

// Retry failed notification (partner)
router.post('/:notificationId/retry', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed notifications can be retried'
      });
    }

    // Reset notification for retry
    notification.status = 'pending';
    notification.failureReason = undefined;
    await notification.save();

    // Process the notification
    await NotificationService.processNotification(notification);

    logger.info(`Notification retry initiated for ID: ${notificationId}`);

    res.json({
      success: true,
      message: 'Notification retry initiated',
      data: {
        notification
      }
    });
  } catch (error) {
    logger.error('Retry notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry notification',
      error: error.message
    });
  }
});

// Get notification templates (partner)
router.get('/templates', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const templates = {
      email: {
        shipment_created: {
          subject: 'Shipment Created - Tracking #{trackingNumber}',
          template: 'Your shipment has been created and is awaiting pickup.'
        },
        package_picked_up: {
          subject: 'Package Picked Up - Tracking #{trackingNumber}',
          template: 'Your package has been picked up and is on its way.'
        },
        in_transit: {
          subject: 'Package In Transit - Tracking #{trackingNumber}',
          template: 'Your package is in transit and will arrive soon.'
        },
        out_for_delivery: {
          subject: 'Out for Delivery - Tracking #{trackingNumber}',
          template: 'Your package is out for delivery and will arrive today.'
        },
        delivered: {
          subject: 'Package Delivered - Tracking #{trackingNumber}',
          template: 'Your package has been successfully delivered.'
        }
      },
      sms: {
        shipment_created: 'Shipment {trackingNumber} created',
        package_picked_up: 'Package {trackingNumber} picked up',
        in_transit: 'Package {trackingNumber} in transit',
        out_for_delivery: 'Package {trackingNumber} out for delivery',
        delivered: 'Package {trackingNumber} delivered'
      }
    };

    res.json({
      success: true,
      data: {
        templates
      }
    });
  } catch (error) {
    logger.error('Get notification templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification templates',
      error: error.message
    });
  }
});

// Admin: Get all notifications
router.get('/admin/all', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const notifications = await Notification.paginate(query, options);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    logger.error('Get all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

module.exports = router;
