import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    attribute: { type: String, required: true },
    value: { type: String, required: true },
    soldAs: { type: String, enum: ["Piece", "Pack"], required: true },
    price: { type: Number, required: true },
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
    attributes: [attributeSchema], // Inline custom attributes with values
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
