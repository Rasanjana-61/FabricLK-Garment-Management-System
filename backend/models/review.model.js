const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // 🆕 added
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
