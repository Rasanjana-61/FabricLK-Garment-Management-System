const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const inquirySchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    messages: [messageSchema],
    isClosed: { type: Boolean, default: false },
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
module.exports = Inquiry;
