const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;
