const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  trackingNumber: {
    type: String,
    required: true
  },
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'webhook'],
    required: true
  },
  event: {
    type: String,
    enum: [
      'shipment_created',
      'package_picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'delivery_attempted',
      'exception',
      'returned_to_sender'
    ],
    required: true
  },
  recipient: {
    email: String,
    phone: String,
    deviceToken: String,
    webhookUrl: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  subject: String,
  message: {
    type: String,
    required: true
  },
  sentAt: Date,
  deliveredAt: Date,
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1 });
notificationSchema.index({ trackingNumber: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Add pagination plugin
notificationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Notification', notificationSchema);
