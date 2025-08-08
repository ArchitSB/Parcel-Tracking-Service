const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { v4: uuidv4 } = require('uuid');

const trackingEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  eventType: {
    type: String,
    enum: [
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
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'exception', 'returned'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  partnerTrackingNumber: {
    type: String,
    trim: true
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  sender: {
    name: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      }
    }
  },
  recipient: {
    name: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      }
    }
  },
  package: {
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    description: String,
    value: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    fragile: {
      type: Boolean,
      default: false
    }
  },
  serviceType: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'same_day'],
    default: 'standard'
  },
  currentStatus: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'exception', 'returned'],
    default: 'pending'
  },
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  events: [trackingEventSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ partnerId: 1 });
shipmentSchema.index({ currentStatus: 1 });
shipmentSchema.index({ 'recipient.email': 1 });
shipmentSchema.index({ createdAt: -1 });

// Generate tracking number
shipmentSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'PT' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Method to add tracking event
shipmentSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  this.currentStatus = eventData.status;
  
  if (eventData.eventType === 'delivered') {
    this.actualDeliveryDate = eventData.timestamp || new Date();
  }
  
  return this.save();
};

// Method to get latest event
shipmentSchema.methods.getLatestEvent = function() {
  return this.events.length > 0 ? this.events[this.events.length - 1] : null;
};

// Virtual for delivery status
shipmentSchema.virtual('isDelivered').get(function() {
  return this.currentStatus === 'delivered';
});

// Add pagination plugin
shipmentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Shipment', shipmentSchema);
