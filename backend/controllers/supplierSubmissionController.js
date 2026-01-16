import asyncHandler from "express-async-handler";
import SupplierSubmission from "../models/SupplierSubmission.model.js";

// Create submission
const createSupplierSubmission = asyncHandler(async (req, res) => {
  const supplier = req.user._id;
  const {
    supplierName,
    supplierId,
    nic,
    email,
    phone,
    dateReceived,
    selectedIngredients,
    otherIngredient,
    items,
    comments,
    grandTotal,
  } = req.body;

  if (!supplierName || !supplierId || !nic || !email || !phone || !items || items.length === 0) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const newSubmission = await SupplierSubmission.create({
    supplier,
    supplierName,
    supplierId,
    nic,
    email,
    phone,
    dateReceived,
    selectedIngredients,
    otherIngredient,
    items,
    comments,
    grandTotal,
  });

  res.status(201).json(newSubmission);
});

// Get submissions of logged-in supplier
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await SupplierSubmission.find({ supplier: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(submissions);
});

// Get all submissions (admin only)
const getAllSubmissions = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
  const submissions = await SupplierSubmission.find().populate("supplier", "username email role").sort({ createdAt: -1 });
  res.status(200).json(submissions);
});

// Delete a submission
const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await SupplierSubmission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  const now = new Date();
  const createdAt = new Date(submission.createdAt);
  const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  if (req.user.role === "Admin") {
    // Admin can delete anytime
  } else if (submission.supplier.toString() === req.user._id.toString()) {
    // Supplier can delete only within 7 days
    if (diffDays > 7) {
      res.status(403);
      throw new Error("Cannot delete submission after 7 days");
    }
  } else {
    res.status(403);
    throw new Error("Not authorized to delete this submission");
  }

  await submission.remove();
  res.status(200).json({ message: "Submission deleted successfully" });
});

// Update a submission
const updateSubmission = asyncHandler(async (req, res) => {
  const submission = await SupplierSubmission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

  const now = new Date();
  const createdAt = new Date(submission.createdAt);
  const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  if (req.user.role === "Admin") {
    // Admin can update anytime
  } else if (submission.supplier.toString() === req.user._id.toString()) {
    // Supplier can update only within 7 days
    if (diffDays > 7) {
      res.status(403);
      throw new Error("Cannot update submission after 7 days");
    }
  } else {
    res.status(403);
    throw new Error("Not authorized to update this submission");
  }

  // Update allowed fields
  const allowedFields = [
    "supplierName",
    "supplierId",
    "nic",
    "email",
    "phone",
    "dateReceived",
    "selectedIngredients",
    "otherIngredient",
    "items",
    "comments",
    "grandTotal",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) submission[field] = req.body[field];
  });

  const updatedSubmission = await submission.save();
  res.status(200).json(updatedSubmission);
});

export { createSupplierSubmission, getMySubmissions, getAllSubmissions, deleteSubmission, updateSubmission };
