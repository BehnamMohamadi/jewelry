// models/cart-model.js

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const cartItemSchema = new Schema(
  {
    itemType: {
      type: String,
      enum: ["Product", "Box"],
      required: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: true,
  },
);

const cartSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// ====================
// Total Items
// ====================

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// ====================
// Virtuals
// ====================

cartSchema.set("toJSON", {
  virtuals: true,
});

cartSchema.set("toObject", {
  virtuals: true,
});

module.exports = model("Cart", cartSchema);
