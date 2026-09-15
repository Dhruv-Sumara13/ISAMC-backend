import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  membershipType: {
    type: String,
    required: true,
    enum: ['Student', 'Regular', 'Senior', 'Institutional', 'International', 'Life', 'Honorary']
  },
  duration: {
    type: String,
    required: true,
    enum: ['annual', 'lifetime']
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'inr'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  purchaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: function() {
      return this.duration === 'annual';
    }
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  benefits: {
    type: [String],
    default: []
  },
  // Auto-renewal settings for annual memberships
  autoRenewal: {
    enabled: {
      type: Boolean,
      default: false
    },
    paymentMethodId: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
membershipSchema.index({ userId: 1, status: 1 });
membershipSchema.index({ expiresAt: 1 });

// Virtual to check if membership is currently active
membershipSchema.virtual('isActive').get(function() {
  if (this.status !== 'active') return false;
  if (this.duration === 'lifetime') return true;
  return this.expiresAt && this.expiresAt > new Date();
});

// Method to check if membership is expiring soon (within 30 days)
membershipSchema.methods.isExpiringSoon = function() {
  if (this.duration === 'lifetime') return false;
  if (!this.expiresAt) return false;
  
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return this.expiresAt <= thirtyDaysFromNow && this.expiresAt > new Date();
};

// Static method to find active memberships expiring soon
membershipSchema.statics.findExpiringSoon = function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return this.find({
    status: 'active',
    duration: 'annual',
    expiresAt: {
      $lte: thirtyDaysFromNow,
      $gt: new Date()
    }
  }).populate('userId', 'name email contact');
};

const membershipModel = mongoose.models.membership || mongoose.model('membership', membershipSchema);

export default membershipModel;
