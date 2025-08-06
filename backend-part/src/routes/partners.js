const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Partner = require('../models/Partner');
const Shipment = require('../models/Shipment');
const { authenticateToken, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get partner profile
router.get('/me', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        partner: req.partner
      }
    });
  } catch (error) {
    logger.error('Get partner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get partner profile',
      error: error.message
    });
  }
});

// Update partner profile
router.put('/me', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.apiKey;
    delete updates.apiSecret;
    delete updates.isActive;

    const partner = await Partner.findByIdAndUpdate(
      req.partner._id,
      updates,
      { new: true, runValidators: true }
    );

    logger.info(`Partner profile updated: ${partner.companyName}`);

    res.json({
      success: true,
      message: 'Partner profile updated successfully',
      data: {
        partner
      }
    });
  } catch (error) {
    logger.error('Update partner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update partner profile',
      error: error.message
    });
  }
});

// Regenerate API credentials
router.post('/me/regenerate-credentials', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const newApiKey = 'pk_' + crypto.randomBytes(16).toString('hex');
    const newApiSecret = crypto.randomBytes(32).toString('hex');

    const partner = await Partner.findByIdAndUpdate(
      req.partner._id,
      {
        apiKey: newApiKey,
        apiSecret: newApiSecret
      },
      { new: true }
    );

    logger.info(`API credentials regenerated for partner: ${partner.companyName}`);

    res.json({
      success: true,
      message: 'API credentials regenerated successfully',
      data: {
        credentials: {
          apiKey: newApiKey,
          apiSecret: newApiSecret
        }
      }
    });
  } catch (error) {
    logger.error('Regenerate credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate credentials',
      error: error.message
    });
  }
});

// Get partner statistics
router.get('/me/stats', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { 
      partnerId: req.partner._id,
      isActive: true 
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    // Get shipment statistics
    const [statusStats, totalShipments, recentShipments] = await Promise.all([
      Shipment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$currentStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      Shipment.countDocuments(matchQuery),
      Shipment.find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .select('trackingNumber currentStatus createdAt recipient.name')
        .lean()
    ]);

    const statusBreakdown = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Calculate delivery rate
    const deliveredCount = statusBreakdown.delivered || 0;
    const deliveryRate = totalShipments > 0 ? (deliveredCount / totalShipments * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalShipments,
        statusBreakdown,
        deliveryRate: parseFloat(deliveryRate),
        recentShipments,
        period: {
          startDate: startDate || 'all time',
          endDate: endDate || 'present'
        }
      }
    });
  } catch (error) {
    logger.error('Get partner stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get partner statistics',
      error: error.message
    });
  }
});

// Get partner service areas
router.get('/me/service-areas', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id).select('serviceAreas');

    res.json({
      success: true,
      data: {
        serviceAreas: partner.serviceAreas
      }
    });
  } catch (error) {
    logger.error('Get service areas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service areas',
      error: error.message
    });
  }
});

// Update partner service areas
router.put('/me/service-areas', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const { serviceAreas } = req.body;

    const partner = await Partner.findByIdAndUpdate(
      req.partner._id,
      { serviceAreas },
      { new: true, runValidators: true }
    );

    logger.info(`Service areas updated for partner: ${partner.companyName}`);

    res.json({
      success: true,
      message: 'Service areas updated successfully',
      data: {
        serviceAreas: partner.serviceAreas
      }
    });
  } catch (error) {
    logger.error('Update service areas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service areas',
      error: error.message
    });
  }
});

// Update webhook URL
router.put('/me/webhook', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const { webhookUrl } = req.body;

    const partner = await Partner.findByIdAndUpdate(
      req.partner._id,
      { webhookUrl },
      { new: true, runValidators: true }
    );

    logger.info(`Webhook URL updated for partner: ${partner.companyName}`);

    res.json({
      success: true,
      message: 'Webhook URL updated successfully',
      data: {
        webhookUrl: partner.webhookUrl
      }
    });
  } catch (error) {
    logger.error('Update webhook URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update webhook URL',
      error: error.message
    });
  }
});

// Get rate limits
router.get('/me/rate-limits', authenticateToken, authorize('partner'), async (req, res) => {
  try {
    const partner = await Partner.findById(req.partner._id).select('rateLimit');

    res.json({
      success: true,
      data: {
        rateLimit: partner.rateLimit
      }
    });
  } catch (error) {
    logger.error('Get rate limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limits',
      error: error.message
    });
  }
});

// Admin routes for partner management
router.get('/', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, partnerType } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (partnerType) {
      query.partnerType = partnerType;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const partners = await Partner.paginate(query, options);

    res.json({
      success: true,
      data: partners
    });
  } catch (error) {
    logger.error('Get partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get partners',
      error: error.message
    });
  }
});

// Admin: Activate/deactivate partner
router.patch('/:partnerId/status', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { isActive } = req.body;

    const partner = await Partner.findByIdAndUpdate(
      partnerId,
      { isActive },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    logger.info(`Partner ${partner.companyName} ${isActive ? 'activated' : 'deactivated'} by admin`);

    res.json({
      success: true,
      message: `Partner ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        partner
      }
    });
  } catch (error) {
    logger.error('Update partner status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update partner status',
      error: error.message
    });
  }
});

module.exports = router;
