const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['Truck', 'Van', 'Motorcycle', 'Car','Minivan'] },
    model: { type: String, required: true },
    specifications: { type: String },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
