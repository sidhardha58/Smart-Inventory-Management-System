import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    saleId: {
      type: Number,
      unique: true,
      default: () => Date.now(), // auto generate
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    soldAs: { type: String, required: true },
    quantity: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

SaleSchema.index({ userId: 1, saleId: 1 });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
