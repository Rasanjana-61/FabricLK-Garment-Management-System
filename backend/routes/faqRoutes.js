const express = require('express');
const router = express.Router();
const { getFaqs, createFaq, updateFaq, deleteFaq } = require('../controllers/faqController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getFaqs) 
    .post(protect, isAdmin, createFaq);

router.route('/:id')
    .put(protect, isAdmin, updateFaq)
    .delete(protect, isAdmin, deleteFaq);

module.exports = router;
