const Product = require("../models/product.model");
const Review = require("../models/review.model"); //  Make sure you have a Review model if using reviews

// 🟢 Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log(" Creating product with data:", req.body);

    const product = new Product(req.body);
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error(" Error creating product:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// 🟣 Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("reviews"); // optional: populate reviews if linked
    console.log(" Total products fetched:", products.length);

    res.json(products);
  } catch (err) {
    console.error(" Error fetching products:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🔵 Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(" Fetching product ID:", id);

    const product = await Product.findById(id).populate("reviews");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error(" Error fetching product:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// 🟡 Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(" Updating product ID:", id, "with data:", req.body);

    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (err) {
    console.error(" Error updating product:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// 🔴 Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(" Deleting product ID:", id);

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(" Error deleting product:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ⭐ Add a review to a product
exports.addReviewToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer, delivery, rating, comment } = req.body;

    console.log(" Adding review to product:", id, "Review data:", req.body);

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 1. Create review
    const review = new Review({ customer, delivery, rating, comment });
    await review.save();

    // 2. Push review ID into product
    product.reviews.push(review._id);
    await product.save();

    // 3. Populate and return updated product
    await product.populate("reviews");

    res.status(201).json(product);
  } catch (err) {
    console.error(" Error adding review:", err.message);
    res.status(500).json({ message: err.message });
  }
};
