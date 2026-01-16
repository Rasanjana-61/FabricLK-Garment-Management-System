const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    pickupAddress: { type: String },
    deliveryAddress: { type: String, required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    status: {
        type: String,
        enum: ['Processing', 'Started', 'On the Way', 'Delivered', 'Cancelled'],
        default: 'Processing',
    },
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery;
