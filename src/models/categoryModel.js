import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // 🔐 Add this field to link the category to a specific user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { versionKey: false }
);

// Optional: Create a unique compound index to prevent duplicate category names per user
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
