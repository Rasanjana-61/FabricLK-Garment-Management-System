


const express = require("express");
const router = express.Router();
const {
  createSupplierSubmission,
  getMySubmissions,
  getAllSubmissions,
  deleteSubmission,
  updateSubmission
} = require("../controllers/supplierSubmissionController");

const { protect, isAdmin } = require("../middleware/authMiddleware");

// Protected routes for suppliers
router.post("/", protect, createSupplierSubmission);
router.get("/mine", protect, getMySubmissions);

// Admin routes
router.get("/", protect, isAdmin, getAllSubmissions);
router.delete("/:id", protect, deleteSubmission);
router.put("/:id", protect, updateSubmission);

module.exports = router;
