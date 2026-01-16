const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email address is required.'],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address.'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required.'],
        match: [/^\d{10,15}$/, 'Phone number must be between 10 and 15 digits.'],
    },
    subject: {
        type: String,
        required: [true, 'Subject is required.'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Message is required.'],
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Resolved'],
        default: 'New',
    },
}, {
    timestamps: true, 
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
