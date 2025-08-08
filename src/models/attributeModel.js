import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

    // 🔐 Add userId to scope attributes per user
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

// 🧠 Optional compound index to allow same attribute name for different users
attributeSchema.index({ name: 1, userId: 1 }, { unique: true });

const Attribute =
  mongoose.models.Attribute || mongoose.model("Attribute", attributeSchema);

export default Attribute;
