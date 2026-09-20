import express from "express";
import { validateCouncilMember } from '../utils/executiveCouncil.js';
import { DB } from "../models/dbSchema.js";
import userModel from "../models/userModel.js";
import membershipModel from "../models/membershipModel.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import logger from "../config/logger.js";
import { 
  promoteToAdmin, 
  demoteFromAdmin, 
  getAllAdmins, 
  getAdminStats 
} from "../utils/adminUtils.js";
import { initializeSampleData } from "../utils/sampleData.js";
import OtherEventController from "../controller/otherEventController.js";

const router = express.Router();

const validateCouncilWrite = (req, res, next) => {
  if (req.params.sectionName !== 'executiveCouncil') return next();
  const members = req.path.startsWith('/update-section/') ? req.body : [req.body];
  if (!Array.isArray(members) || !members.every(validateCouncilMember)) {
    return res.status(400).json({ success: false, message: 'A member name and optional affiliation are required, with a maximum of 200 characters each.' });
  }
  next();
};

// Other events routes (moved to top)
router.post('/other-events', OtherEventController.createEvent);
router.put('/other-events/:id', OtherEventController.updateEvent);

// Initialize sample data
router.post("/initialize-data", userAuth, adminAuth, async (req, res) => {
  try {
    const result = await initializeSampleData(DB);
    
    logger.info('Sample data initialization requested', { 
      adminId: req.user._id, // Fixed: Removed backslash
      result: result.message 
    });
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Sample data initialization error', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({ 
      success: false, 
      message: "Error initializing sample data",
      error: error.message 
    });
  }
});

// Get admin dashboard data with statistics
router.get("/dashboard", userAuth, adminAuth, async (req, res) => {
  try {
    const [contentData, userStats] = await Promise.all([
      DB.findOne({}),
      getAdminStats()
    ]);
    
    // If no data exists, initialize with sample data
    if (!contentData) {
      console.log('No data found, initializing sample data...');
      await initializeSampleData(DB);
      const newContentData = await DB.findOne({});
      
      res.status(200).json({ 
        success: true, 
        data: newContentData,
        stats: userStats,
        message: 'Sample data initialized'
      });
      return;
    }
    

    
    console.log('Admin dashboard data fetched successfully');
    
    res.status(200).json({ 
      success: true, 
      data: contentData,
      stats: userStats
    });
  } catch (error) {
    logger.error('Dashboard fetch error', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({ 
      success: false, 
      message: "Error fetching dashboard data",
      error: error.message 
    });
  }
});

// Update section data
router.put("/update-section/:sectionName", userAuth, adminAuth, validateCouncilWrite, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const updateData = req.body;

    const result = await DB.findOneAndUpdate(
      {},
      { [sectionName]: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      message: `${sectionName} updated successfully`, // Fixed: Proper template literal
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating section",
      error: error.message 
    });
  }
});

// Add item to section array
router.post("/add-item/:sectionName", userAuth, adminAuth, validateCouncilWrite, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const newItem = { ...req.body, _id: new Date().getTime().toString() };

    const result = await DB.findOneAndUpdate(
      {},
      { $push: { [sectionName]: newItem } },
      { new: true, upsert: true }
    );

    res.status(201).json({ 
      success: true, 
      message: "Item added successfully",
      data: result[sectionName] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error adding item",
      error: error.message 
    });
  }
});

// Update specific item in section array
router.put("/update-item/:sectionName/:itemId", userAuth, adminAuth, validateCouncilWrite, async (req, res) => {
  try {
    const { sectionName, itemId } = req.params;
    const updateData = req.body;

    const result = await DB.findOneAndUpdate(
      { [`${sectionName}._id`]: itemId }, // Fixed: Proper template literal
      { $set: { [`${sectionName}.$`]: updateData } }, // Fixed: Proper template literal
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Item updated successfully",
      data: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error updating item",
      error: error.message 
    });
  }
});

// Delete item from section array
router.delete("/delete-item/:sectionName/:itemId", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName, itemId } = req.params;
    console.log(`Deleting item ${itemId} from section ${sectionName}`);

    const result = await DB.findOneAndUpdate(
      {},
      { $pull: { [sectionName]: { _id: itemId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Section not found" 
      });
    }

    console.log(`Delete operation completed for ${sectionName}`);
    res.status(200).json({ 
      success: true, 
      message: "Item deleted successfully",
      data: result[sectionName] 
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting item",
      error: error.message 
    });
  }
});

// Get specific section data
router.get("/section/:sectionName", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const document = await DB.findOne({});
    const sectionData = document?.[sectionName] || [];
    
    res.status(200).json({ success: true, data: sectionData });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching section data",
      error: error.message 
    });
  }
});

// Upload image (placeholder - implement file upload)
router.post("/upload-image", userAuth, adminAuth, async (req, res) => {
  try {
    // TODO: Implement actual file upload logic
    res.status(200).json({ 
      success: true, 
      message: "Image upload endpoint - implement file upload logic",
      imageUrl: "placeholder-url" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error uploading image",
      error: error.message 
    });
  }
});

// Bulk upload items from Excel
router.post("/bulk-upload/:sectionName", userAuth, adminAuth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data format or empty data array"
      });
    }

    // Validate data based on section
    const validationErrors = [];
    data.forEach((item, index) => {
      const errors = validateBulkUploadItem(item, sectionName);
      if (errors.length > 0) {
        validationErrors.push({
          row: index + 1,
          errors
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors found",
        errors: validationErrors
      });
    }

    // Add items to the database
    const result = await DB.findOneAndUpdate(
      {},
      { $push: { [sectionName]: { $each: data } } },
      { new: true, upsert: true }
    );

    logger.info('Bulk upload successful', { 
      sectionName: encodeURIComponent(sectionName), 
      count: data.length, 
      adminId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${data.length} items to ${sectionName}`, // Fixed: Template literal
      data: result[sectionName]
    });
  } catch (error) {
    logger.error('Bulk upload error', { 
      error: error.message, 
      sectionName: encodeURIComponent(req.params.sectionName), 
      adminId: req.user._id
    });
    res.status(500).json({
      success: false,
      message: "Error uploading data",
      error: error.message
    });
  }
});

// Helper function to validate bulk upload items
const validateBulkUploadItem = (item, sectionName) => {
  const errors = [];

  switch (sectionName) {
    case 'executiveCouncil':
      if (!validateCouncilMember(item)) errors.push('Valid member name and optional affiliation required (maximum 200 characters each)');
      break;
    case 'Publications':
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!item.subtitle || item.subtitle.trim() === '') {
        errors.push('Subtitle is required');
      }
      if (!item.body || item.body.trim() === '') {
        errors.push('Body is required');
      }
      break;
    case 'News':
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!item.body || item.body.trim() === '') {
        errors.push('Body is required');
      }
      if (!item.date || item.date.trim() === '') {
        errors.push('Date is required');
      }
      break;
    case 'Events':
    case 'upevents':
    case 'pastEvents':
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!item.body || item.body.trim() === '') {
        errors.push('Body is required');
      }
      if (!item.date || item.date.trim() === '') {
        errors.push('Date is required');
      }
      if (!item.location || item.location.trim() === '') {
        errors.push('Location is required');
      }
      break;
    case 'equipment':
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
      if (!item.body || item.body.trim() === '') {
        errors.push('Body is required');
      }
      break;
    default:
      if (!item.title || item.title.trim() === '') {
        errors.push('Title is required');
      }
  }

  return errors;
};

// User Management Routes

// Search users (MUST be before parameterized routes)
router.get("/users/search", userAuth, adminAuth, async (req, res) => {
  try {
    const { q, role } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    const users = await userModel.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({ success: true, users });
  } catch (error) {
    logger.error('Error searching users', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message
    });
  }
});

// Get all users with pagination
router.get("/users", userAuth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; // Fixed: Removed backslash

    const users = await userModel.find({})
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await userModel.countDocuments();
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching users', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
});

// Get all admin users
router.get("/admins", userAuth, adminAuth, async (req, res) => {
  try {
    const admins = await getAllAdmins();
    res.status(200).json({ success: true, admins });
  } catch (error) {
    logger.error('Error fetching admins', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error fetching admin users",
      error: error.message
    });
  }
});

// Promote user to admin
router.put("/users/:userId/promote", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await promoteToAdmin(userId, req.user);
    
    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      user: updatedUser
    });
  } catch (error) {
    logger.error('Error promoting user', { 
      error: error.message, 
      userId: req.params.userId, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Demote admin to user
router.put("/users/:userId/demote", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUser = await demoteFromAdmin(userId, req.user);
    
    res.status(200).json({
      success: true,
      message: "Admin demoted to user successfully",
      user: updatedUser
    });
  } catch (error) {
    logger.error('Error demoting user', { 
      error: error.message, 
      userId: req.params.userId, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete user (soft delete by deactivating)
router.delete("/users/:userId", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent self-deletion
    if (userId === req.user._id.toString()) { // Fixed: Removed backslash
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }
    
    const user = await userModel.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    logger.info('User deleted by admin', {
      deletedUserId: userId,
      deletedUserEmail: user.email,
      adminId: req.user._id, // Fixed: Removed backslash
      adminEmail: req.user.email
    });
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    logger.error('Error deleting user', { 
      error: error.message, 
      userId: req.params.userId, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
});

// Get user statistics
router.get("/stats", userAuth, adminAuth, async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    logger.error('Error fetching stats', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message
    });
  }
});

// Membership Management Routes

// Search memberships (MUST be before parameterized routes)
router.get("/memberships/search", userAuth, adminAuth, async (req, res) => {
  try {
    const { q, status, membershipType } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;
    
    let memberships;
    
    if (q) {
      // First, find users matching the search query
      const users = await userModel.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }).select('_id'); // Fixed: Removed backslash
      
      const userIds = users.map(user => user._id); // Fixed: Removed backslash
      query.userId = { $in: userIds };
    }
    
    memberships = await membershipModel.find(query)
      .populate({
        path: 'userId',
        select: 'name email contact institute designation'
      })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({ success: true, memberships });
  } catch (error) {
    logger.error('Error searching memberships', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error searching memberships",
      error: error.message
    });
  }
});

// Get membership statistics
router.get("/memberships/stats", userAuth, adminAuth, async (req, res) => {
  try {
    const [totalMemberships, activeMemberships, expiringSoon, membershipsByType, membershipsByStatus] = await Promise.all([
      membershipModel.countDocuments(),
      membershipModel.countDocuments({ status: 'active' }),
      membershipModel.findExpiringSoon(),
      membershipModel.aggregate([
        { $group: { _id: '$membershipType', count: { $sum: 1 } } } // Fixed: Removed backslash
      ]),
      membershipModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } } // Fixed: Removed backslash
      ])
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalMemberships,
        activeMemberships,
        expiringSoonCount: expiringSoon.length,
        expiringSoon: expiringSoon.map(m => ({
          _id: m._id, // Fixed: Removed backslash
          membershipType: m.membershipType,
          expiresAt: m.expiresAt,
          user: {
            name: m.userId?.name,
            email: m.userId?.email
          }
        })),
        membershipsByType: membershipsByType.reduce((acc, item) => {
          acc[item._id] = item.count; // Fixed: Removed backslash
          return acc;
        }, {}),
        membershipsByStatus: membershipsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count; // Fixed: Removed backslash
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Error fetching membership stats', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error fetching membership statistics",
      error: error.message
    });
  }
});

// Get all memberships with pagination and filters
router.get("/memberships", userAuth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; // Fixed: Removed backslash
    const status = req.query.status;
    const membershipType = req.query.membershipType;
    const duration = req.query.duration;
    
    // Build query filters
    let query = {};
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;
    if (duration) query.duration = duration;
    
    const memberships = await membershipModel.find(query)
      .populate({
        path: 'userId',
        select: 'name email contact institute designation'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await membershipModel.countDocuments(query);
    
    res.status(200).json({
      success: true,
      memberships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching memberships', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error fetching memberships",
      error: error.message
    });
  }
});

// Update membership status
router.put("/memberships/:membershipId/status", userAuth, adminAuth, async (req, res) => {
  try {
    const { membershipId } = req.params;
    const { status, reason } = req.body;
    
    if (!['active', 'expired', 'cancelled', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }
    
    const membership = await membershipModel.findByIdAndUpdate(
      membershipId,
      { status },
      { new: true }
    ).populate('userId', 'name email contact');
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found"
      });
    }
    
    logger.info('Membership status updated', {
      membershipId,
      oldStatus: membership.status,
      newStatus: status,
      reason,
      adminId: req.user._id // Fixed: Removed backslash
    });
    
    res.status(200).json({
      success: true,
      message: "Membership status updated successfully",
      membership
    });
  } catch (error) {
    logger.error('Error updating membership status', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error updating membership status",
      error: error.message
    });
  }
});

// Get specific membership details
router.get("/memberships/:membershipId", userAuth, adminAuth, async (req, res) => {
  try {
    const { membershipId } = req.params;
    
    const membership = await membershipModel.findById(membershipId)
      .populate({
        path: 'userId',
        select: 'name email contact institute designation gender dateOfBirth expertise linkedinProfile'
      });
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found"
      });
    }
    
    res.status(200).json({
      success: true,
      membership
    });
  } catch (error) {
    logger.error('Error fetching membership details', { 
      error: error.message, 
      adminId: req.user._id // Fixed: Removed backslash
    });
    res.status(500).json({
      success: false,
      message: "Error fetching membership details",
      error: error.message
    });
  }
});

export default router;
