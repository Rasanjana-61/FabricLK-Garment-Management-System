const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/vehicle.model');


const getVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
});


const createVehicle = asyncHandler(async (req, res) => {
    const { plateNumber, type, model, specifications } = req.body;
    if (!plateNumber || !type || !model) {
        res.status(400);
        throw new Error('Please provide plate number, type, and model');
    }
    const vehicle = new Vehicle({ plateNumber, type, model, specifications });
    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
});


const updateVehicle = asyncHandler(async (req, res) => {
    const { plateNumber, type, model, specifications, isAvailable } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
        vehicle.plateNumber = plateNumber || vehicle.plateNumber;
        vehicle.type = type || vehicle.type;
        vehicle.model = model || vehicle.model;
        vehicle.specifications = specifications || vehicle.specifications;
        if(isAvailable !== undefined) {
            vehicle.isAvailable = isAvailable;
        }
        const updatedVehicle = await vehicle.save();
        res.json(updatedVehicle);
    } else {
        res.status(404);
        throw new Error('Vehicle not found');
    }
});


const deleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
    }
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle removed' });
});

module.exports = { getVehicles, createVehicle, updateVehicle, deleteVehicle };
