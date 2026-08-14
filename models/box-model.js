// box-model.js

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const boxSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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

boxSchema.pre("validate", async function () {
  if (!this.isNew || this.sku) return;

  const lastBox = await mongoose
    .model("Box")
    .findOne({
      sku: /^BOX-\d{4}$/,
    })
    .sort({ sku: -1 })
    .select("sku");

  let nextNumber = 1;

  if (lastBox) {
    const lastNumber = Number(lastBox.sku.slice(-4));
    nextNumber = lastNumber + 1;
  }

  this.sku = `BOX-${String(nextNumber).padStart(4, "0")}`;
});

// ====================
// Total Price
// ====================

boxSchema.virtual("totalPrice").get(function () {
  if (!this.populated("products.product")) {
    return null;
  }

  return this.products.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
});

// ====================
// Final Price
// ====================

boxSchema.virtual("finalPrice").get(function () {
  const totalPrice = this.totalPrice;

  if (totalPrice === null) {
    return null;
  }

  return totalPrice - totalPrice * (this.discount / 100);
});

// ====================
// Virtuals in JSON
// ====================

boxSchema.set("toJSON", {
  virtuals: true,
});

boxSchema.set("toObject", {
  virtuals: true,
});

module.exports = model("Box", boxSchema);
