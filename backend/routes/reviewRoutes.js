const express = require('express');
const router = express.Router();
const { createReview, getMyReviews, getAllReviews } = require('../controllers/reviewController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReview)
    .get( getAllReviews);

router.get('/my-reviews', protect, getMyReviews);

module.exports = router;
