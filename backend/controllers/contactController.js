const asyncHandler = require('express-async-handler');
const Contact = require('../models/contact.model');


const submitContactForm = asyncHandler(async (req, res) => {
    const { fullName, email, phoneNumber, subject, message } = req.body;

    // Basic validation
    if (!fullName || !email || !phoneNumber || !subject || !message) {
        res.status(400);
        throw new Error('Please fill out all required fields.');
    }

    const contactMessage = await Contact.create({
        fullName,
        email,
        phoneNumber,
        subject,
        message,
    });

    if (contactMessage) {
        res.status(201).json({ message: 'Your message has been sent successfully! We will get back to you shortly.' });
    } else {
        res.status(400);
        throw new Error('Invalid data provided. Could not send message.');
    }
});


const getContactMessages = asyncHandler(async (req, res) => {
    // Sort by most recent messages first
    const messages = await Contact.find({}).sort({ createdAt: -1 });
    res.json(messages);
});


const updateContactMessage = asyncHandler(async (req, res) => {
    const { fullName, email, phoneNumber, subject, message } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Contact message not found');
    }

    // Update fields
    contact.fullName = fullName || contact.fullName;
    contact.email = email || contact.email;
    contact.phoneNumber = phoneNumber || contact.phoneNumber;
    contact.subject = subject || contact.subject;
    contact.message = message || contact.message;

    const updatedContact = await contact.save();
    res.json(updatedContact);
});


const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Contact message not found');
    }

    await contact.deleteOne(); 
    res.json({ message: 'Contact message deleted successfully' });
});


module.exports = {
    submitContactForm,
    getContactMessages,
    updateContactMessage,
    deleteContact,
};
