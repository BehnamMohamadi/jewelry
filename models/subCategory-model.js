// subcategory-model.js

const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    icon: {
      type: String,
      default: "default-icon.jpeg",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Subcategory", subcategorySchema);
