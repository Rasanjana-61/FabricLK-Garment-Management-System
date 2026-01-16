const asyncHandler = require('express-async-handler');
const Inquiry = require('../models/inquiry.model');


const createInquiry = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    if (!subject || !message) {
        res.status(400);
        throw new Error('Please provide a subject and a message');
    }

    const inquiry = await Inquiry.create({
        customer: req.user._id,
        subject,
        messages: [{ sender: req.user._id, text: message }],
    });

    res.status(201).json(inquiry);
});


const addMessageToInquiry = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (inquiry) {
        // Check if user is the customer or an admin
        if (inquiry.customer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            res.status(403);
            throw new Error('User not authorized');
        }

        if (inquiry.isClosed) {
            res.status(400);
            throw new Error('Cannot reply to a closed inquiry');
        }

        const newMessage = { sender: req.user._id, text: message };
        inquiry.messages.push(newMessage);
        await inquiry.save();
        
        const populatedInquiry = await Inquiry.findById(inquiry._id).populate('customer', 'username').populate('messages.sender', 'username role');
        res.json(populatedInquiry);

    } else {
        res.status(404);
        throw new Error('Inquiry not found');
    }
});


const getMyInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.find({ customer: req.user._id }).populate('messages.sender', 'username role');
    res.json(inquiries);
});


const getAllInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.find({}).populate('customer', 'username').populate('messages.sender', 'username role');
    res.json(inquiries);
});

const closeInquiry = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id);
    if (inquiry) {
        inquiry.isClosed = true;
        const updatedInquiry = await inquiry.save();
        res.json(updatedInquiry);
    } else {
        res.status(404);
        throw new Error('Inquiry not found');
    }
});


module.exports = { createInquiry, addMessageToInquiry, getMyInquiries, getAllInquiries, closeInquiry };
