// utils/validations/cart-validator.js

const Joi = require("joi");

// ====================
// ObjectId Validation
// ====================

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// ====================
// Add To Cart
// ====================

const addToCartValidationSchema = Joi.object({
  itemType: Joi.string().valid("Product", "Box").required().messages({
    "any.only": "itemType must be either Product or Box",
    "any.required": "itemType is required",
    "string.empty": "itemType cannot be empty",
  }),

  item: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "item must be a valid MongoDB ObjectId",
    "any.required": "item is required",
    "string.empty": "item cannot be empty",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "quantity must be a number",
    "number.integer": "quantity must be an integer",
    "number.min": "quantity must be at least 1",
    "any.required": "quantity is required",
  }),
});

// ====================
// Update Cart Item
// ====================

const updateCartItemValidationSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "quantity must be a number",
    "number.integer": "quantity must be an integer",
    "number.min": "quantity must be at least 1",
    "any.required": "quantity is required",
  }),
});

// ====================
// Cart Item ID
// ====================

const cartItemIdValidationSchema = Joi.object({
  itemId: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "itemId must be a valid MongoDB ObjectId",
    "any.required": "itemId is required",
  }),
});

// ====================
// Exports
// ====================

module.exports = {
  addToCartValidationSchema,
  updateCartItemValidationSchema,
  cartItemIdValidationSchema,
};
