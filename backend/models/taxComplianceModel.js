const mongoose = require('mongoose');

const taxComplianceSchema = new mongoose.Schema({
  taxType: {
    type: String,
    required: true,
    enum: ['Income Tax', 'VAT', 'NBT', 'ESC', 'Stamp Duty', 'Other']
  },
  period: { type: String, required: true }, // e.g., YYYY-MM
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  paymentDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue'], default: 'Pending' },
  description: { type: String, trim: true },
  documents: [{ name: String, url: String }],
  penalty: { type: Number, default: 0, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

taxComplianceSchema.virtual('isOverdue').get(function () {
  return this.dueDate < new Date() && this.status !== 'Paid';
});

taxComplianceSchema.virtual('remainingAmount').get(function () {
  return this.amount - this.paidAmount;
});

module.exports = mongoose.model('TaxCompliance', taxComplianceSchema);