// product-model.js

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const productSchema = new Schema(
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

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "unisex", "kids"],
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "default-thumbnail.jpeg",
    },

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ====================
// Generate SKU
// ====================

productSchema.pre("validate", async function () {
  if (!this.isNew || this.sku) return;

  const category = await mongoose
    .model("Category")
    .findById(this.category)
    .select("slug name");

  if (!category) {
    throw new Error("Category not found");
  }

  const categoryCode = category.slug.split("-")[0].substring(0, 4).toUpperCase();

  const genderCode = {
    male: "M",
    female: "W",
    unisex: "U",
  }[this.gender];

  const lastProduct = await mongoose
    .model("Product")
    .findOne({
      sku: new RegExp(`^${categoryCode}-${genderCode}-\\d{4}$`),
    })
    .sort({ sku: -1 })
    .select("sku");

  let nextNumber = 1;

  if (lastProduct) {
    const lastNumber = Number(lastProduct.sku.slice(-4));
    nextNumber = lastNumber + 1;
  }

  this.sku = `${categoryCode}-${genderCode}-${String(nextNumber).padStart(4, "0")}`;
});
module.exports = model("Product", productSchema);
