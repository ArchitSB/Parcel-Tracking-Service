const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const partnerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    unique: true,
    required: true
  },
  apiSecret: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  partnerType: {
    type: String,
    enum: ['shipping', 'logistics', 'ecommerce', 'courier'],
    required: true
  },
  serviceAreas: [{
    country: String,
    regions: [String]
  }],
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
  },
  businessRegistration: {
    registrationNumber: String,
    taxId: String,
    license: String
  },
  rateLimit: {
    requestsPerHour: {
      type: Number,
      default: 1000
    },
    requestsPerDay: {
      type: Number,
      default: 10000
    }
  },
  webhookUrl: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient API key lookups
partnerSchema.index({ apiKey: 1 });
partnerSchema.index({ isActive: 1 });

// Remove sensitive data from JSON output
partnerSchema.methods.toJSON = function() {
  const partner = this.toObject();
  delete partner.apiSecret;
  return partner;
};

// Add pagination plugin
partnerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Partner', partnerSchema);
