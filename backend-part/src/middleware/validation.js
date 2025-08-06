const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// User registration validation
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional()
  }).optional()
});

// User login validation
const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Shipment creation validation
const shipmentCreateSchema = Joi.object({
  partnerTrackingNumber: Joi.string().optional(),
  sender: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  }).required(),
  recipient: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  }).required(),
  package: Joi.object({
    weight: Joi.object({
      value: Joi.number().positive().required(),
      unit: Joi.string().valid('kg', 'lb').default('kg')
    }).optional(),
    dimensions: Joi.object({
      length: Joi.number().positive().required(),
      width: Joi.number().positive().required(),
      height: Joi.number().positive().required(),
      unit: Joi.string().valid('cm', 'in').default('cm')
    }).optional(),
    description: Joi.string().optional(),
    value: Joi.object({
      amount: Joi.number().positive().optional(),
      currency: Joi.string().default('USD')
    }).optional(),
    fragile: Joi.boolean().default(false)
  }).optional(),
  serviceType: Joi.string().valid('standard', 'express', 'overnight', 'same_day').default('standard'),
  estimatedDeliveryDate: Joi.date().optional(),
  metadata: Joi.object().optional()
});

// Tracking event validation
const trackingEventSchema = Joi.object({
  eventType: Joi.string().valid(
    'shipment_created',
    'package_picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'delivery_attempted',
    'exception',
    'returned_to_sender',
    'lost',
    'damaged'
  ).required(),
  status: Joi.string().valid('pending', 'in_transit', 'delivered', 'exception', 'returned').required(),
  description: Joi.string().required(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).optional()
  }).optional(),
  timestamp: Joi.date().optional(),
  metadata: Joi.object().optional()
});

// Partner registration validation
const partnerRegistrationSchema = Joi.object({
  companyName: Joi.string().trim().required(),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string().required(),
  partnerType: Joi.string().valid('shipping', 'logistics', 'ecommerce', 'courier').required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  businessRegistration: Joi.object({
    registrationNumber: Joi.string().optional(),
    taxId: Joi.string().optional(),
    license: Joi.string().optional()
  }).optional(),
  serviceAreas: Joi.array().items(
    Joi.object({
      country: Joi.string().required(),
      regions: Joi.array().items(Joi.string()).optional()
    })
  ).optional()
});

// Notification subscription validation
const notificationSubscriptionSchema = Joi.object({
  trackingNumber: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  preferences: Joi.object({
    emailNotifications: Joi.boolean().default(true),
    smsNotifications: Joi.boolean().default(false),
    pushNotifications: Joi.boolean().default(true)
  }).optional()
});

module.exports = {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  shipmentCreateSchema,
  trackingEventSchema,
  partnerRegistrationSchema,
  notificationSubscriptionSchema
};
