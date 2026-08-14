const Joi = require("joi");

// ====================
// ObjectId
// ====================

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// ====================
// Add Product
// ====================

const addProductValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name cannot exceed 100 characters",
    "string.empty": "Product name cannot be empty",
    "any.required": "Product name is required",
  }),

  slug: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Product slug must be at least 2 characters long",
    "string.max": "Product slug cannot exceed 100 characters",
    "string.empty": "Product slug cannot be empty",
    "any.required": "Product slug is required",
  }),

  category: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Category must be a valid ID",
    "any.required": "Category is required",
  }),

  subCategory: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "subCategory must be a valid ID",
    "any.required": "subCategory is required",
  }),

  gender: Joi.string().valid("male", "female", "unisex", "kids").required().messages({
    "any.only": "Gender must be male, female or unisex or kids ",
    "any.required": "Gender is required",
  }),

  price: Joi.number().positive().precision(2).required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than zero",
    "any.required": "Price is required",
  }),

  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity cannot be negative",
    "any.required": "Quantity is required",
  }),

  brand: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Brand must be at least 2 characters long",
    "string.max": "Brand cannot exceed 50 characters",
    "string.empty": "Brand cannot be empty",
    "any.required": "Brand is required",
  }),

  description: Joi.string().min(10).max(2000).trim().required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
    "string.empty": "Description cannot be empty",
    "any.required": "Description is required",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),
});

// ====================
// Edit Product
// ====================

const editProductValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional().messages({
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name cannot exceed 100 characters",
    "string.empty": "Product name cannot be empty",
  }),

  slug: Joi.string().min(2).max(100).trim().optional().messages({
    "string.min": "Product slug must be at least 2 characters long",
    "string.max": "Product slug cannot exceed 100 characters",
    "string.empty": "Product slug cannot be empty",
  }),

  category: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "Category must be a valid ID",
  }),

  subCategory: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "subCategory must be a valid ID",
  }),

  gender: Joi.string().valid("male", "female", "unisex", "kids").optional().messages({
    "any.only": "Gender must be male, female or unisex or kids",
  }),

  price: Joi.number().positive().precision(2).optional().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than zero",
  }),

  quantity: Joi.number().integer().min(0).optional().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity cannot be negative",
  }),

  brand: Joi.string().min(2).max(50).trim().optional().messages({
    "string.min": "Brand must be at least 2 characters long",
    "string.max": "Brand cannot exceed 50 characters",
    "string.empty": "Brand cannot be empty",
  }),

  description: Joi.string().min(10).max(2000).trim().optional().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
    "string.empty": "Description cannot be empty",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),
});

// ====================
// Product Images
// ====================

const updateProductImagesValidationSchema = Joi.array()
  .min(1)
  .max(10)
  .required()
  .messages({
    "array.base": "Product images must be an array",
    "array.min": "At least one product image is required",
    "array.max": "You can upload a maximum of 10 product images",
    "any.required": "Product images are required",
  });

// ====================
// Product Thumbnail
// ====================

const updateProductThumbnailValidationSchema = Joi.object({
  fieldname: Joi.string().valid("thumbnail").required(),

  originalname: Joi.string().required(),

  mimetype: Joi.string()
    .valid("image/jpeg", "image/jpg", "image/png", "image/webp")
    .required()
    .messages({
      "any.only": "Thumbnail must be a JPEG, JPG, PNG or WebP image",
    }),

  size: Joi.number()
    .positive()
    .max(5 * 1024 * 1024)
    .required()
    .messages({
      "number.max": "Thumbnail size cannot exceed 5MB",
    }),
}).unknown(true);

// ====================
// Exports
// ====================

module.exports = {
  addProductValidationSchema,
  editProductValidationSchema,
  updateProductImagesValidationSchema,
  updateProductThumbnailValidationSchema,
};
