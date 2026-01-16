// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getUsers,
  updateUserById,
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

//  Get all users (Admin only)
router.route('/').get(protect, getUsers);

//  Profile routes
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

//  Update password (specific path comes before :id)
router.route('/update-password').put(protect, updatePassword);

//  Update user by ID (must come after fixed routes)
router.route('/:id').put(protect,isAdmin, updateUserById);

module.exports = router;
