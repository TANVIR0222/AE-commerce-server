import mongoose from "mongoose";
// Schema definition
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: function () {
      return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
    },
  },
  image: {
    type: [String], // Array of image URLs
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  colors: {
    type: [String], // Array of color names
    default: [],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4,
  },
  sizes: {
    type: [String], // Array of sizes
    default: [],
  },
  quantity: {
    type: Number,
    default: 1, // Default quantity is 1
  },
  new: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create model
const ProductModel = mongoose.model('Product', productSchema);

export default ProductModel; // Export the model
