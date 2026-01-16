const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Product CRUD
router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Add a review to a product
router.patch("/:id/reviews", productController.addReviewToProduct);

module.exports = router;
