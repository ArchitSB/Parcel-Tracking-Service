const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { validate, shipmentCreateSchema, trackingEventSchema } = require('../middleware/validation');
const { authenticateToken, authenticateApiKey, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/:trackingNumber', optionalAuth, shipmentController.getShipmentByTracking);
router.get('/:trackingNumber/events', shipmentController.getShipmentEvents);
router.get('/search/by-email', shipmentController.getShipmentsByEmail);

// Partner routes (require API key or token)
router.post('/', authenticateApiKey, validate(shipmentCreateSchema), shipmentController.createShipment);
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
