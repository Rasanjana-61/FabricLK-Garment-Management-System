const asyncHandler = require('express-async-handler');
const Review = require('../models/review.model');
const Delivery = require('../models/delivery.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

// 🧩 Create Review
const createReview = asyncHandler(async (req, res) => {
    const { deliveryId, rating, comment } = req.body;

    // 1️⃣ Find the delivery
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
        res.status(404);
        throw new Error('Delivery not found');
    }

    // 2️⃣ Validate customer ownership
    if (delivery.customer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('User not authorized to review this delivery');
    }

    // 3️⃣ Ensure delivery is completed
    if (delivery.status !== 'Delivered') {
        res.status(400);
        throw new Error('Delivery must be completed to be reviewed');
    }

    // 4️⃣ Prevent duplicate reviews
    const alreadyReviewed = await Review.findOne({ delivery: deliveryId });
    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Delivery already reviewed');
    }

    // 5️⃣ Fetch the related order and product
    const order = await Order.findById(delivery.orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found for this delivery');
    }

    const productId = order?.customerOrderDetails?.productId;
    if (!productId) {
        res.status(404);
        throw new Error('Product not found in order details');
    }

    // 6️⃣ Create the review with product reference
    const review = await Review.create({
        customer: req.user._id,
        delivery: deliveryId,
        product: productId, // ✅ added product reference
        rating,
        comment,
    });

    // 7️⃣ Optionally link review to product for reverse lookup
    await Product.findByIdAndUpdate(
        productId,
        { $push: { reviews: review._id } },
        { new: true }
    );

    res.status(201).json(review);
});

// 🧾 Get Reviews for Logged-in Customer
const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ customer: req.user._id })
        .populate({
            path: 'delivery',
            select: 'orderId deliveryAddress',
        })
        .populate({
            path: 'product',
            select: 'name price thumbnail',
        });
    res.json(reviews);
});

// 🗂️ Get All Reviews (Admin)
const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({})
        .populate('customer', 'username email')
        .populate('delivery', 'orderId')
        .populate('product', 'name');
    res.json(reviews);
});

module.exports = { createReview, getMyReviews, getAllReviews };
