const express = require('express');
const router = express.Router();
const { createInquiry, addMessageToInquiry, getMyInquiries, getAllInquiries, closeInquiry } = require('../controllers/inquiryController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInquiry)
    .get(protect, isAdmin, getAllInquiries);

router.get('/my-inquiries', protect, getMyInquiries);

router.put('/:id/reply', protect, addMessageToInquiry);
router.put('/:id/close', protect, isAdmin, closeInquiry);


module.exports = router;
