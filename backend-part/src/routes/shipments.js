const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { validate, shipmentCreateSchema, trackingEventSchema } = require('../middleware/validation');
const { authenticateToken, authenticateApiKey, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/:trackingNumber', optionalAuth, shipmentController.getShipmentByTracking);
router.get('/:trackingNumber/events', shipmentController.getShipmentEvents);
router.get('/search/by-email', shipmentController.getShipmentsByEmail);

// Partner routes (require API key or partner JWT token)
router.post('/', 
  async (req, res, next) => {
    // Try API key first, then JWT token for partners
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      return authenticateApiKey(req, res, next);
    } else {
      return authenticateToken(req, res, (err) => {
        if (err) return next(err);
        // Check if user is a partner
        if (req.tokenData && req.tokenData.type === 'partner') {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'Partner access required'
        });
      });
    }
  },
  validate(shipmentCreateSchema), 
  shipmentController.createShipment
);
router.get('/', authenticateToken, authorize('partner'), shipmentController.getPartnerShipments);
router.put('/:trackingNumber', authenticateToken, authorize('partner'), shipmentController.updateShipment);
router.get('/stats/overview', authenticateToken, authorize('partner'), shipmentController.getShipmentStats);

// Partner tracking event routes
router.post('/:trackingNumber/events', 
  authenticateApiKey, 
  validate(trackingEventSchema), 
  shipmentController.addTrackingEvent
);

module.exports = router;
