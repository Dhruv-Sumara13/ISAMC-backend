import Stripe from 'stripe';
import userModel from '../models/userModel.js';
import membershipModel from '../models/membershipModel.js';
import transactionModel from '../models/transactionModel.js';
import sendCpanelEmail from '../utils/cpanelEmail.js';
import { validationResult } from 'express-validator';

// Membership pricing configuration
const MEMBERSHIP_PRICING = {
  'Student': {
    annual: 500,
    lifetime: 5000,
    benefits: [
      'Access to research papers and publications',
      'Student networking events',
      'Career guidance resources',
      'Educational webinars and workshops'
    ]
  },
  'Regular': {
    annual: 1000,
    lifetime: 10000,
    benefits: [
      'Full access to all publications',
      'Professional networking events',
      'Industry conferences access',
      'Technical workshops and seminars',
      'Career development resources'
    ]
  },
  'Senior': {
    annual: 750,
    lifetime: 7500,
    benefits: [
      'All regular member benefits',
      'Senior member recognition',
      'Mentorship opportunities',
      'Priority access to events'
    ]
  },
  'Institutional': {
    annual: 5000,
    lifetime: 50000,
    benefits: [
      'Multiple user access',
      'Institutional recognition',
      'Bulk resource access',
      'Corporate training programs',
      'Industry partnership opportunities'
    ]
  },
  'International': {
    annual: 2000,
    lifetime: 20000,
    benefits: [
      'Global membership benefits',
      'International conference access',
      'Cross-border networking',
      'Research collaboration opportunities'
    ]
  },
  'Life': {
    lifetime: 15000,
    benefits: [
      'Lifetime access to all resources',
      'Premium member privileges',
      'Alumni network access',
      'Legacy member recognition',
      'All future benefits included'
    ]
  }
};

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Check if Stripe is properly configured
if (!stripe) {
  console.warn('⚠️ Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.');
}

// Helper function to send email notifications
const sendEmailNotification = async (to, subject, template, data) => {
  try {
    await sendCpanelEmail({
      to,
      subject,
      html: generateEmailTemplate(template, data)
    });
    console.log('Email notification sent successfully to:', to);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// Email template generator
const generateEmailTemplate = (template, data) => {
  const templates = {
    'payment_success': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Successful!</h1>
            <p>Welcome to ISAMC Membership</p>
          </div>
          <div class="content">
            <div class="success-badge">✓ Payment Confirmed</div>
            <p>Dear ${data.userName},</p>
            <p>Thank you for your membership purchase! Your payment has been processed successfully.</p>
            
            <div class="details">
              <h3>Membership Details:</h3>
              <p><strong>Type:</strong> ${data.membershipType}</p>
              <p><strong>Duration:</strong> ${data.duration}</p>
              <p><strong>Amount Paid:</strong> ₹${data.amount}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Valid Until:</strong> ${data.expiresAt || 'Lifetime'}</p>
            </div>
            
            <div class="details">
              <h3>Your Benefits Include:</h3>
              <ul>
                ${data.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
            </div>
            
            <p>You can access your membership dashboard anytime by logging into your account.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing ISAMC!</p>
            <p>© 2024 Indian Society for Advancement of Materials and Process Engineering</p>
          </div>
        </div>
      </body>
      </html>
    `,
    'payment_failed': `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .failed-badge { background: #ef4444; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Payment Failed</h1>
            <p>There was an issue with your payment</p>
          </div>
          <div class="content">
            <div class="failed-badge">✗ Payment Unsuccessful</div>
            <p>Dear ${data.userName},</p>
            <p>We were unable to process your membership payment. Please try again or contact our support team.</p>
            
            <div class="details">
              <h3>Transaction Details:</h3>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Amount:</strong> ₹${data.amount}</p>
              <p><strong>Reason:</strong> ${data.failureReason}</p>
            </div>
            
            <p>You can retry your payment by visiting the membership section in your account.</p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at support@isamc.org</p>
            <p>© 2024 Indian Society for Advancement of Materials and Process Engineering</p>
          </div>
        </div>
      </body>
      </html>
    `,
    'refund_initiated': `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Refund initiated</h1>
          <p>Dear ${data.userName},</p>
          <p>Your ISAMC membership refund has been initiated.</p>
          <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #2563eb;">
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Refund amount:</strong> ₹${data.refundAmount}</p>
            <p><strong>Reason:</strong> ${data.reason || 'Not provided'}</p>
          </div>
          <p>The amount will be returned according to your payment provider's processing time.</p>
          <p>Best regards,<br>The ISAMC Team</p>
        </div>
      </body>
      </html>
    `
  };
  
  return templates[template] || '';
};

// Get membership pricing
export const getMembershipPricing = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      pricing: MEMBERSHIP_PRICING
    });
  } catch (error) {
    console.error('Error fetching membership pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching membership pricing'
    });
  }
};

// Create payment intent for frontend
export const createPaymentIntent = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured. Please contact administrator.'
      });
    }

    const { membershipType, membershipDuration, amount } = req.body;
    const userId = req.user.id;

    // Validate pricing
    const pricing = MEMBERSHIP_PRICING[membershipType];
    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership type'
      });
    }

    const expectedAmount = pricing[membershipDuration];
    if (expectedAmount !== amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount for selected membership type and duration'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'inr',
      metadata: {
        userId,
        membershipType,
        membershipDuration
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
};

// Process payment for membership
export const processPayment = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured. Please contact administrator.'
      });
    }

    const {
      membershipType,
      membershipDuration,
      paymentIntentId,
      userDetails: {
        fullName,
        email,
        phone,
        institute,
        designation
      }
    } = req.body;

    // Validate required fields
    if (!membershipType || !membershipDuration || !paymentIntentId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Get pricing and validate
    const pricing = MEMBERSHIP_PRICING[membershipType];
    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership type'
      });
    }

    const amount = pricing[membershipDuration];
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership duration for this type'
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has an active membership
    const existingMembership = await membershipModel.findOne({
      userId: user._id,
      status: 'active'
    });

    if (existingMembership && existingMembership.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active membership'
      });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed successfully'
      });
    }

    // Verify amount matches
    const paidAmount = paymentIntent.amount / 100; // Convert from paise to rupees
    if (paidAmount !== amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    // Calculate membership expiry date
    let expiresAt;
    if (membershipDuration === 'lifetime' || membershipType === 'Life') {
      // Set to a far future date for lifetime membership
      expiresAt = new Date('2099-12-31');
    } else {
      // Annual membership - expires in 1 year
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Create membership record
    const membership = new membershipModel({
      userId: user._id,
      membershipType,
      duration: membershipDuration,
      amount: amount,
      currency: 'inr',
      status: 'active',
      purchaseDate: new Date(),
      expiresAt: expiresAt,
      paymentIntentId: paymentIntent.id,
      benefits: pricing.benefits
    });

    await membership.save();

    // Create transaction record
    const transaction = new transactionModel({
      userId: user._id,
      membershipId: membership._id,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: 'inr',
      status: 'completed',
      paymentMethod: 'stripe',
      transactionDate: new Date(),
      membershipType,
      membershipDuration,
      paymentGatewayResponse: paymentIntent
    });

    await transaction.save();

    // Update user profile with membership details if provided
    if (fullName || phone || institute || designation) {
      const updateData = {};
      if (fullName && fullName !== user.name) updateData.name = fullName;
      if (phone && phone !== user.contact) updateData.contact = phone;
      if (institute && institute !== user.institute) updateData.institute = institute;
      if (designation && designation !== user.designation) updateData.designation = designation;

      if (Object.keys(updateData).length > 0) {
        await userModel.findByIdAndUpdate(user._id, updateData);
      }
    }

    // Send success email notification
    await sendEmailNotification(
      user.email,
      'ISAMC Membership Purchase Successful',
      'payment_success',
      {
        userName: user.name || fullName,
        membershipType,
        duration: membershipDuration,
        amount,
        transactionId: transaction.transactionId,
        expiresAt: membershipDuration === 'lifetime' ? null : expiresAt.toDateString(),
        benefits: pricing.benefits
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment successful and membership activated',
      data: {
        membershipId: membership._id,
        transactionId: transaction.transactionId,
        paymentIntentId: paymentIntent.id,
        membershipType,
        membershipDuration,
        expiresAt: membership.expiresAt,
        amount: amount,
        currency: 'inr',
        benefits: pricing.benefits
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Create failed transaction record if we have enough information
    if (req.body.email) {
      try {
        const user = await userModel.findOne({ email: req.body.email });
        if (user) {
          const transaction = new transactionModel({
            userId: user._id,
            amount: req.body.amount || 0,
            currency: req.body.currency || 'inr',
            status: 'failed',
            paymentMethod: 'stripe',
            transactionDate: new Date(),
            membershipType: req.body.membershipType,
            membershipDuration: req.body.membershipDuration,
            failureReason: error.message
          });
          await transaction.save();
        }
      } catch (dbError) {
        console.error('Error saving failed transaction:', dbError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during payment processing',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Payment processing failed'
    });
  }
};

// Get user's membership status
export const getMembershipStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user

    const membership = await membershipModel.findOne({
      userId,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!membership) {
      return res.status(200).json({
        success: true,
        hasMembership: false,
        message: 'No active membership found'
      });
    }

    // Check if membership has expired
    const now = new Date();
    const isExpired = membership.expiresAt && membership.expiresAt < now;

    if (isExpired) {
      // Update membership status to expired
      membership.status = 'expired';
      await membership.save();

      return res.status(200).json({
        success: true,
        hasMembership: false,
        message: 'Membership has expired'
      });
    }

    res.status(200).json({
      success: true,
      hasMembership: true,
      membership: {
        type: membership.membershipType,
        duration: membership.duration,
        purchaseDate: membership.purchaseDate,
        expiresAt: membership.expiresAt,
        status: membership.status
      }
    });

  } catch (error) {
    console.error('Error fetching membership status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching membership status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Filter by status if provided

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const transactions = await transactionModel.find(filter)
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('membershipId', 'membershipType duration status');

    const totalTransactions = await transactionModel.countDocuments(filter);
    const transactionStats = await transactionModel.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      transactions,
      statistics: transactionStats,
      pagination: {
        page,
        limit,
        total: totalTransactions,
        pages: Math.ceil(totalTransactions / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Initiate refund for a transaction
export const initiateRefund = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    const userId = req.user.id;

    // Find the transaction
    const transaction = await transactionModel.findOne({
      _id: transactionId,
      userId: userId,
      status: 'completed'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or not eligible for refund'
      });
    }

    // Check if refund is allowed
    if (!transaction.canRefund()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not eligible for refund (older than 30 days or already refunded)'
      });
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.paymentIntentId,
      amount: Math.round(transaction.amount * 100), // Convert to paise
      reason: 'requested_by_customer',
      metadata: {
        userId: userId,
        transactionId: transactionId,
        reason: reason
      }
    });

    // Update transaction with refund details
    transaction.refundDetails = {
      refundId: refund.id,
      refundAmount: transaction.amount,
      refundDate: new Date(),
      refundReason: reason,
      refundStatus: 'pending'
    };
    transaction.status = 'refunded';
    await transaction.save();

    // Update membership status if applicable
    if (transaction.membershipId) {
      const membership = await membershipModel.findById(transaction.membershipId);
      if (membership) {
        membership.status = 'cancelled';
        await membership.save();
      }
    }

    // Send refund notification email
    const user = await userModel.findById(userId);
    await sendEmailNotification(
      user.email,
      'ISAMC Membership Refund Initiated',
      'refund_initiated',
      {
        userName: user.name,
        transactionId: transaction.transactionId,
        refundAmount: transaction.amount,
        reason: reason
      }
    );

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      refund: {
        refundId: refund.id,
        amount: transaction.amount,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error initiating refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Renew membership
export const renewMembership = async (req, res) => {
  try {
    const { membershipId, paymentMethodId } = req.body;
    const userId = req.user.id;

    // Find the membership
    const membership = await membershipModel.findOne({
      _id: membershipId,
      userId: userId
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    // Check if membership is eligible for renewal
    if (membership.duration === 'lifetime') {
      return res.status(400).json({
        success: false,
        message: 'Lifetime memberships do not require renewal'
      });
    }

    // Get renewal price (same as annual price)
    const pricing = MEMBERSHIP_PRICING[membership.membershipType];
    const renewalAmount = pricing.annual;

    // Create payment intent for renewal
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(renewalAmount * 100),
      currency: 'inr',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        userId: userId,
        membershipId: membershipId,
        type: 'renewal'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Extend membership by 1 year
      const newExpiryDate = new Date(membership.expiresAt);
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
      
      membership.expiresAt = newExpiryDate;
      membership.status = 'active';
      await membership.save();

      // Create renewal transaction
      const renewalTransaction = new transactionModel({
        userId: userId,
        membershipId: membership._id,
        paymentIntentId: paymentIntent.id,
        amount: renewalAmount,
        currency: 'inr',
        status: 'completed',
        paymentMethod: 'stripe',
        transactionDate: new Date(),
        membershipType: membership.membershipType,
        membershipDuration: 'annual',
        description: `Membership renewal for ${membership.membershipType}`,
        paymentGatewayResponse: paymentIntent
      });

      await renewalTransaction.save();

      res.status(200).json({
        success: true,
        message: 'Membership renewed successfully',
        data: {
          membershipId: membership._id,
          newExpiryDate: membership.expiresAt,
          transactionId: renewalTransaction.transactionId,
          amount: renewalAmount
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed for membership renewal'
      });
    }

  } catch (error) {
    console.error('Error renewing membership:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing membership renewal',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get payment analytics for admin
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchConditions = {};
    if (startDate && endDate) {
      matchConditions.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Revenue analytics
    const revenueStats = await transactionModel.aggregate([
      { $match: { status: 'completed', ...matchConditions } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    // Membership type breakdown
    const membershipBreakdown = await transactionModel.aggregate([
      { $match: { status: 'completed', ...matchConditions } },
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await transactionModel.aggregate([
      { $match: { status: 'completed', ...matchConditions } },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Payment method stats
    const paymentMethodStats = await transactionModel.aggregate([
      { $match: { status: 'completed', ...matchConditions } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        revenue: revenueStats[0] || { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 },
        membershipBreakdown,
        monthlyRevenue,
        paymentMethodStats
      }
    });

  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.dispute.created':
        await handleChargeback(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper functions for webhook handling
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const transaction = await transactionModel.findOne({
      paymentIntentId: paymentIntent.id
    });

    if (transaction && transaction.status === 'pending') {
      transaction.status = 'completed';
      transaction.paymentGatewayResponse = paymentIntent;
      await transaction.save();

      // Activate membership if applicable
      if (transaction.membershipId) {
        const membership = await membershipModel.findById(transaction.membershipId);
        if (membership) {
          membership.status = 'active';
          await membership.save();
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment success webhook:', error);
  }
};

const handlePaymentFailure = async (paymentIntent) => {
  try {
    const transaction = await transactionModel.findOne({
      paymentIntentId: paymentIntent.id
    });

    if (transaction) {
      transaction.status = 'failed';
      transaction.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
      transaction.paymentGatewayResponse = paymentIntent;
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling payment failure webhook:', error);
  }
};

const handleChargeback = async (charge) => {
  try {
    // Find transaction by charge ID
    const transaction = await transactionModel.findOne({
      'paymentGatewayResponse.charges.data.id': charge.id
    });

    if (transaction) {
      transaction.status = 'disputed';
      await transaction.save();

      // Deactivate associated membership
      if (transaction.membershipId) {
        const membership = await membershipModel.findById(transaction.membershipId);
        if (membership) {
          membership.status = 'suspended';
          await membership.save();
        }
      }
    }
  } catch (error) {
    console.error('Error handling chargeback webhook:', error);
  }
};
