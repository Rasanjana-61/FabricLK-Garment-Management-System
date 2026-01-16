// models/SupplierSubmission.js
const mongoose = require('mongoose');

// Sub-schema for individual items
const itemSchema = new mongoose.Schema({
  itemNo: { type: String, required: true },
  description: { type: String, required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

// Main schema for supplier submissions
const supplierSubmissionSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assumes your suppliers are stored in User collection
      required: true,
    },
    supplierName: { type: String, required: true },
    supplierId: { type: String, required: true },
    nic: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateReceived: { type: Date, required: true },
    selectedIngredients: [{ type: String }],
    otherIngredient: { type: String },
    items: [itemSchema], // array of item sub-documents
    comments: { type: String },
    grandTotal: { type: Number },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

// Create the model
const SupplierSubmission = mongoose.model(
  "SupplierSubmission",
  supplierSubmissionSchema
);

// Export the model
module.exports = SupplierSubmission;
