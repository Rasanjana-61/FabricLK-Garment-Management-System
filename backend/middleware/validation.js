
const validateExpense = (req, res, next) => {
  const { title, amount, date, category, description } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required and must be a valid string");
  } else if (title.length > 50) {
    errors.push("Title cannot exceed 50 characters");
  }

  // Amount validation
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push("Amount is required and must be a positive number");
  }

  // Date validation - cannot be future date and within last 7 days
  if (!date) {
    errors.push("Date is required");
  } else {
    const inputDate = new Date(date);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    if (inputDate > today) {
      errors.push("Date cannot be in the future");
    } else if (inputDate < sevenDaysAgo) {
      errors.push("Date cannot be older than 7 days");
    }
  }

  // Category validation
  if (
    !category ||
    typeof category !== "string" ||
    category.trim().length === 0
  ) {
    errors.push("Category is required");
  }

  // Description validation
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    errors.push("Description is required");
  } else if (description.length > 200) {
    errors.push("Description cannot exceed 200 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validateIncome = (req, res, next) => {
  const { title, amount, date, category, description } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required and must be a valid string");
  } else if (title.length > 50) {
    errors.push("Title cannot exceed 50 characters");
  }

  // Amount validation
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push("Amount is required and must be a positive number");
  }

  // Date validation - cannot be future date and within last 7 days
  if (!date) {
    errors.push("Date is required");
  } else {
    const inputDate = new Date(date);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    if (inputDate > today) {
      errors.push("Date cannot be in the future");
    } else if (inputDate < sevenDaysAgo) {
      errors.push("Date cannot be older than 7 days");
    }
  }

  // Category validation
  if (
    !category ||
    typeof category !== "string" ||
    category.trim().length === 0
  ) {
    errors.push("Category is required");
  }

  // Description validation
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    errors.push("Description is required");
  } else if (description.length > 200) {
    errors.push("Description cannot exceed 200 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validateSalary = (req, res, next) => {
  const {
    employeeId, // OPTIONAL: when present, employeeName/role can be skipped (will be snapped from DB)
    employeeName, // REQUIRED if no employeeId
    role, // REQUIRED if no employeeId
    basicSalary,
    paymentDate,
    allowances,
    deductions,
    otHours,
  } = req.body;

  const errors = [];

  // Allow either: selected employeeId OR manual employeeName + role
  if (!employeeId) {
    // Employee name validation (manual)
    if (
      !employeeName ||
      typeof employeeName !== "string" ||
      employeeName.trim().length === 0
    ) {
      errors.push("Employee name is required and must be a valid string");
    } else if (/[0-9]/.test(employeeName)) {
      errors.push("Employee name cannot contain numbers");
    } else if (employeeName.length > 50) {
      errors.push("Employee name cannot exceed 50 characters");
    }

    // Role validation (manual)
    if (!role || typeof role !== "string" || role.trim().length === 0) {
      errors.push("Role is required and must be a valid string");
    }
  }

  // Basic salary validation
  if (!basicSalary || isNaN(basicSalary) || parseFloat(basicSalary) <= 0) {
    errors.push("Basic salary is required and must be a positive number");
  }

  // Date validation - cannot be future date
  if (!paymentDate) {
    errors.push("Payment date is required");
  } else {
    const inputDate = new Date(paymentDate);
    const today = new Date();

    if (inputDate > today) {
      errors.push("Payment date cannot be in the future");
    }
  }

  // Allowances and deductions validation (optional fields)
  if (
    allowances !== undefined &&
    (isNaN(allowances) || parseFloat(allowances) < 0)
  ) {
    errors.push("Allowances must be a non-negative number");
  }

  if (
    deductions !== undefined &&
    (isNaN(deductions) || parseFloat(deductions) < 0)
  ) {
    errors.push("Deductions must be a non-negative number");
  }

  // OT hours (optional)
  if (otHours !== undefined && (isNaN(otHours) || parseFloat(otHours) < 0)) {
    errors.push("OT hours must be a non-negative number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validateTaxRecord = (req, res, next) => {
  const { taxType, period, dueDate, amount } = req.body;
  const errors = [];

  // Tax type validation
  const validTaxTypes = [
    "Income Tax",
    "VAT",
    "NBT",
    "ESC",
    "Stamp Duty",
    "Other",
  ];
  if (!taxType || !validTaxTypes.includes(taxType)) {
    errors.push(
      "Tax type is required and must be one of: " + validTaxTypes.join(", ")
    );
  }

  // Period validation (YYYY-MM format)
  if (!period || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    errors.push("Period is required and must be in YYYY-MM format");
  }

  // Due date validation
  if (!dueDate) {
    errors.push("Due date is required");
  }

  // Amount validation
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push("Amount is required and must be a positive number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateExpense,
  validateIncome,
  validateSalary,
  validateTaxRecord,
};
