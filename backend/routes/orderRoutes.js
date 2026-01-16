

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order.model');

// CRUD operations
router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);


//payment
router.put('/update-on-success/:id', async (req, res) => {
  try {
    const { paymentIntentId, updatedOrderData } = req.body;
    const { id } = req.params;

    if (!paymentIntentId || !updatedOrderData) {
      return res.status(400).json({ error: 'Missing payment intent or order details' });
    }

    // 1. Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // 2. Find and update the existing order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        ...updatedOrderData,
        isPaid: true,
        status: 'Pending',
        paymentIntentId: paymentIntent.id,
      },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ success: true, order: updatedOrder });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order.' });
  }
});


module.exports = router;
