import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    metrics: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: "At least one metric is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Attribute =
  mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);

export default Attribute;
