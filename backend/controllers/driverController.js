const asyncHandler = require('express-async-handler');
const Driver = require('../models/driver.model');


const getDrivers = asyncHandler(async (req, res) => {
    const drivers = await Driver.find({});
    res.json(drivers);
});


const createDriver = asyncHandler(async (req, res) => {
    const { name, contact, licenseNumber } = req.body;
    if (!name || !contact || !licenseNumber) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }
    const driver = new Driver({ name, contact, licenseNumber });
    const createdDriver = await driver.save();
    res.status(201).json(createdDriver);
});


const updateDriver = asyncHandler(async (req, res) => {
    const { name, contact, licenseNumber, isAvailable } = req.body;
    const driver = await Driver.findById(req.params.id);

    if (driver) {
        driver.name = name || driver.name;
        driver.contact = contact || driver.contact;
        driver.licenseNumber = licenseNumber || driver.licenseNumber;
        if(isAvailable !== undefined) {
             driver.isAvailable = isAvailable;
        }
        const updatedDriver = await driver.save();
        res.json(updatedDriver);
    } else {
        res.status(404);
        throw new Error('Driver not found');
    }
});


const deleteDriver = asyncHandler(async (req, res) => {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
        res.status(404);
        throw new Error('Driver not found');
    }
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver removed' });
});

module.exports = { getDrivers, createDriver, updateDriver, deleteDriver };
