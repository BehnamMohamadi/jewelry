// routes/cart-route.js

const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controller/cart-controller");

const { protect } = require("../controller/auth-controller");
const { asyncHandler } = require("../utils/async-handler");
const { validator } = require("../validation/validator");

const {
  addToCartValidationSchema,
  updateCartItemValidationSchema,
  cartItemIdValidationSchema,
} = require("../validation/cart-validator");

// ====================
// Authentication
// ====================

router.use(asyncHandler(protect));

// ====================
// Get Cart
// ====================

router.get("/", asyncHandler(getCart));

// ====================
// Add Product / Box
// ====================

router.post("/", validator(addToCartValidationSchema), asyncHandler(addToCart));

// ====================
// Update Quantity
// ====================

router.patch(
  "/:itemId",
  validator(cartItemIdValidationSchema, "params"),
  validator(updateCartItemValidationSchema),
  asyncHandler(updateCartItem),
);

// ====================
// Remove Item
// ====================

router.delete(
  "/:itemId",
  validator(cartItemIdValidationSchema, "params"),
  asyncHandler(removeFromCart),
);

// ====================
// Clear Cart
// ====================

router.delete("/", asyncHandler(clearCart));

module.exports = router;
