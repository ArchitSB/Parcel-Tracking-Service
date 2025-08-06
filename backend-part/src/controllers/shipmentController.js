const Shipment = require('../models/Shipment');
const Partner = require('../models/Partner');
const NotificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// Create new shipment
const createShipment = async (req, res) => {
  try {
    const shipmentData = { ...req.body };
    
    // Set partner ID from authenticated partner
    if (req.partner) {
      shipmentData.partnerId = req.partner._id;
    } else {
      return res.status(401).json({
        success: false,
        message: 'Partner authentication required'
      });
    }

    // Create shipment
    const shipment = new Shipment(shipmentData);
    await shipment.save();

    // Add initial tracking event
    await shipment.addEvent({
      eventType: 'shipment_created',
      status: 'pending',
      description: 'Shipment created and awaiting pickup',
      createdBy: {
        partnerId: req.partner._id
      }
    });

    // Send notifications
    await NotificationService.sendShipmentNotification(shipment, 'shipment_created');

    logger.info(`New shipment created: ${shipment.trackingNumber} by partner: ${req.partner.companyName}`);

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: {
        shipment
      }
    });
  } catch (error) {
    logger.error('Shipment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

// Get shipment by tracking number (public endpoint)
const getShipmentByTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await Shipment.findOne({ 
      trackingNumber: trackingNumber.toUpperCase(),
      isActive: true 
    })
    .populate('partnerId', 'companyName partnerType')
    .lean();

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Remove sensitive partner information for public access
    const publicShipment = {
      ...shipment,
      partnerId: {
        companyName: shipment.partnerId.companyName,
        partnerType: shipment.partnerId.partnerType
      }
    };

    res.json({
      success: true,
      data: {
        shipment: publicShipment
      }
    });
  } catch (error) {
    logger.error('Get shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipment',
      error: error.message
    });
  }
};

// Get shipments for authenticated partner
const getPartnerShipments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const query = { 
      partnerId: req.partner._id,
      isActive: true 
    };

    // Add filters
    if (status) {
      query.currentStatus = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'partnerId',
        select: 'companyName partnerType'
      }
    };

    const shipments = await Shipment.paginate(query, options);

    res.json({
      success: true,
      data: shipments
    });
  } catch (error) {
    logger.error('Get partner shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipments',
      error: error.message
    });
  }
};

// Add tracking event to shipment
const addTrackingEvent = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const eventData = { ...req.body };

    const shipment = await Shipment.findOne({ 
      trackingNumber: trackingNumber.toUpperCase(),
      partnerId: req.partner._id,
      isActive: true 
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or unauthorized'
      });
    }

    // Add creator information
    eventData.createdBy = {
      partnerId: req.partner._id
    };

    // Add the tracking event
    await shipment.addEvent(eventData);

    // Send notifications
    await NotificationService.sendShipmentNotification(shipment, eventData.eventType);

    logger.info(`Tracking event added to ${trackingNumber}: ${eventData.eventType}`);

    res.json({
      success: true,
      message: 'Tracking event added successfully',
      data: {
        shipment,
        latestEvent: shipment.getLatestEvent()
      }
    });
  } catch (error) {
    logger.error('Add tracking event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add tracking event',
      error: error.message
    });
  }
};

// Get shipment events history
const getShipmentEvents = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await Shipment.findOne({ 
      trackingNumber: trackingNumber.toUpperCase(),
      isActive: true 
    })
    .select('trackingNumber events currentStatus')
    .lean();

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        currentStatus: shipment.currentStatus,
        events: shipment.events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      }
    });
  } catch (error) {
    logger.error('Get shipment events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipment events',
      error: error.message
    });
  }
};

// Update shipment details (for partners)
const updateShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.trackingNumber;
    delete updates.partnerId;
    delete updates.events;
    delete updates.currentStatus;

    const shipment = await Shipment.findOneAndUpdate(
      { 
        trackingNumber: trackingNumber.toUpperCase(),
        partnerId: req.partner._id,
        isActive: true 
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or unauthorized'
      });
    }

    logger.info(`Shipment updated: ${trackingNumber} by partner: ${req.partner.companyName}`);

    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: {
        shipment
      }
    });
  } catch (error) {
    logger.error('Update shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipment',
      error: error.message
    });
  }
};

// Get shipments by recipient email (for customers)
const getShipmentsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const shipments = await Shipment.find({
      'recipient.email': email.toLowerCase(),
      isActive: true
    })
    .populate('partnerId', 'companyName partnerType')
    .sort({ createdAt: -1 })
    .lean();

    res.json({
      success: true,
      data: {
        shipments: shipments.map(shipment => ({
          ...shipment,
          partnerId: {
            companyName: shipment.partnerId.companyName,
            partnerType: shipment.partnerId.partnerType
          }
        }))
      }
    });
  } catch (error) {
    logger.error('Get shipments by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipments',
      error: error.message
    });
  }
};

// Get shipment statistics (for partners)
const getShipmentStats = async (req, res) => {
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

    const stats = await Shipment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalShipments = await Shipment.countDocuments(matchQuery);
    
    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalShipments,
        statusBreakdown: statusStats,
        period: {
          startDate: startDate || 'all time',
          endDate: endDate || 'present'
        }
      }
    });
  } catch (error) {
    logger.error('Get shipment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shipment statistics',
      error: error.message
    });
  }
};

module.exports = {
  createShipment,
  getShipmentByTracking,
  getPartnerShipments,
  addTrackingEvent,
  getShipmentEvents,
  updateShipment,
  getShipmentsByEmail,
  getShipmentStats
};
