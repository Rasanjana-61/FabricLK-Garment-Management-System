const mongoose = require('mongoose');

const CustomerOrderDetailsSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  selectedColor: String,
  selectedWaist: Number,
  selectedInseam: String,
  customerRequirements: String,
  sampleDesignImage: String,
  uploadedImageName: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  address: {
    street: String,
    street2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
});

const OrderSchema = new mongoose.Schema({
  status: { type: String, default: 'Pending' },
  isPaid: { type: Boolean, default: 'false' },
  notes: { type: String },
  customerOrderDetails: CustomerOrderDetailsSchema,
  orderedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Order', OrderSchema);
