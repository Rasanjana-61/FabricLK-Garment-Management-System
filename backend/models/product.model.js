const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    img: { type: String, required: true },
    discount: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "Blouse",
        "Trousers",
        "Dresses",
        "Sweaters",
        "Jackets",
        "Shirts",
        "Shorts",
        "Jeans",
      ],
      required: true,
    },
    reviews: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Review" } // <-- reference review IDs
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
