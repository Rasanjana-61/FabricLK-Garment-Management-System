
const asyncHandler = require('express-async-handler');
const Delivery = require('../models/delivery.model');
const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');

const getDeliveries = asyncHandler(async (req, res) => {
    const deliveries = await Delivery.find({}).populate('customer', 'username').populate('driver', 'name').populate('vehicle', 'plateNumber');
    res.json(deliveries);
});


const getMyDeliveries = asyncHandler(async (req, res) => {
    const deliveries = await Delivery.find({ customer: req.user._id }).populate('driver', 'name').populate('vehicle', 'plateNumber');
    res.json(deliveries);
});

const getDeliveryById = asyncHandler(async (req, res) => {
    const delivery = await Delivery.findById(req.params.id)
        .populate('customer', 'username')
        .populate('driver', 'name')
        .populate('vehicle', 'plateNumber');

    if (delivery) {
        res.json(delivery);
    } else {
        res.status(404);
        throw new Error('Delivery not found');
    }
});



const createDelivery = asyncHandler(async (req, res) => {
    // This controller is now designed for an Admin creating a delivery.
    const { orderId, customer, pickupAddress, deliveryAddress } = req.body;

    if (!orderId || !customer || !pickupAddress || !deliveryAddress) {
        res.status(400);
        throw new Error('Please provide all required fields: orderId, customer, pickupAddress, and deliveryAddress');
    }

    const deliveryExists = await Delivery.findOne({ orderId });
    if (deliveryExists) {
        res.status(400);
        throw new Error('Delivery with this Order ID already exists.');
    }

    const delivery = new Delivery({
        orderId,
        customer,
        pickupAddress,
        deliveryAddress,
    });

    const createdDelivery = await delivery.save();
    res.status(201).json(createdDelivery);
});


const updateDelivery = asyncHandler(async (req, res) => {
    const { driverId, vehicleId, status } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (delivery) {
        const oldStatus = delivery.status;
        
        delivery.driver = driverId !== undefined ? driverId : delivery.driver;
        delivery.vehicle = vehicleId !== undefined ? vehicleId : delivery.vehicle;
        delivery.status = status || delivery.status;

        if (status && status !== oldStatus) {
            if (status === 'Started') {
                if (delivery.driver) await Driver.findByIdAndUpdate(delivery.driver, { isAvailable: false });
                if (delivery.vehicle) await Vehicle.findByIdAndUpdate(delivery.vehicle, { isAvailable: false });
            } else if (status === 'Delivered' || status === 'Cancelled') {
                if (delivery.driver) await Driver.findByIdAndUpdate(delivery.driver, { isAvailable: true });
                if (delivery.vehicle) await Vehicle.findByIdAndUpdate(delivery.vehicle, { isAvailable: true });
            }
        }

        const updatedDelivery = await delivery.save();
        const populatedDelivery = await Delivery.findById(updatedDelivery._id)
            .populate('customer', 'username')
            .populate('driver', 'name')
            .populate('vehicle', 'plateNumber');
        
        res.json(populatedDelivery);
    } else {
        res.status(404);
        throw new Error('Delivery not found');
    }
});

module.exports = { getDeliveries, getMyDeliveries, createDelivery, updateDelivery, getDeliveryById  };

