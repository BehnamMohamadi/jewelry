//category-model.js

const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // جوراب   → SOCK
    // پیراهن  → SHIRT
    // شلوار   → PANT
    // کفش     → SHOE
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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

module.exports = model("Category", categorySchema);
