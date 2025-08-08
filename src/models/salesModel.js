import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    saleId: {
      type: Number,
      required: true,
      unique: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // links to the original product document
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    soldAs: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    tax: {
      type: Number,
      required: true,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    // 🔐 Added userId to scope sale to a user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Optional: Add an index on userId and saleId if needed
SaleSchema.index({ userId: 1, saleId: 1 });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
