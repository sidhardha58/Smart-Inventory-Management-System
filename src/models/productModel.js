import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    attribute: { type: String, required: true },
    value: { type: String, required: true },
    soldAs: { type: String, enum: ["Piece", "Pack"], required: true },
    price: { type: Number, required: true }, // 🔸 Selling Price
    buyingPrice: { type: Number, required: true }, // 🔹 Buying Price (NEW)
    inventory: { type: Number, required: true },
    tax: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    image: {
      type: String, // Single image URL or path
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    attributes: [attributeSchema],

    // 🔐 Add userId to scope products per user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: unique product name per user
productSchema.index({ name: 1, userId: 1 }, { unique: true });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
