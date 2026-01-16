// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getContactMessages,
    updateContactMessage,
    deleteContact
} = require('../controllers/contactController');
const { protect, isAdmin } = require('../middleware/authMiddleware');


router.route('/')
    .post(submitContactForm)
    
    .get(protect, isAdmin, getContactMessages);


router.route('/:id')
    .put(protect, isAdmin, updateContactMessage)
    .delete(protect, isAdmin, deleteContact);

module.exports = router;
