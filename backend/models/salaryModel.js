
const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  // Link the salary to an employee (optional but recommended)
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // Snapshots at the time of payment (kept even if employee changes later)
  employeeName: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  department: { type: String, trim: true, default: '' },

  basicSalary: { type: Number, required: true, min: 0 },
  allowances: { type: Number, default: 0, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },

  otHours: { type: Number, default: 0, min: 0 },
  otRate: { type: Number, default: 1.5 },
  otPay: { type: Number, default: 0 },

  epfRate: { type: Number, default: 8 },
  epfDeduction: { type: Number, default: 0 },

  etfRate: { type: Number, default: 3 },
  etfDeduction: { type: Number, default: 0 },

  netSalary: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, required: true },

  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },

  // Finance manager who created the record
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);