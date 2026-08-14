const Joi = require("joi");

// ====================
// ObjectId
// ====================

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// ====================
// Product inside Box
// ====================

const boxProductSchema = Joi.object({
  product: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Product ID is not valid",
    "string.empty": "Product ID cannot be empty",
    "any.required": "Product ID is required",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Product quantity must be a number",
    "number.integer": "Product quantity must be an integer",
    "number.min": "Product quantity must be at least 1",
    "any.required": "Product quantity is required",
  }),
});

// ====================
// Add Box
// ====================

const addBoxValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Box name must be at least 2 characters long",
    "string.max": "Box name cannot exceed 100 characters",
    "string.empty": "Box name cannot be empty",
    "any.required": "Box name is required",
  }),

  slug: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Box slug must be at least 2 characters long",
    "string.max": "Box slug cannot exceed 100 characters",
    "string.empty": "Box slug cannot be empty",
    "any.required": "Box slug is required",
  }),

  description: Joi.string().trim().max(2000).optional().allow("").messages({
    "string.max": "Description cannot exceed 2000 characters",
  }),

  products: Joi.array().items(boxProductSchema).min(1).required().messages({
    "array.min": "Box must contain at least one product",
    "any.required": "Box products are required",
  }),

  discount: Joi.number().min(0).max(100).precision(2).optional().messages({
    "number.base": "Discount must be a number",
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),
});

// ====================
// Edit Box
// ====================

const editBoxValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional().messages({
    "string.min": "Box name must be at least 2 characters long",
    "string.max": "Box name cannot exceed 100 characters",
    "string.empty": "Box name cannot be empty",
  }),

  slug: Joi.string().min(2).max(100).trim().optional().messages({
    "string.min": "Box slug must be at least 2 characters long",
    "string.max": "Box slug cannot exceed 100 characters",
    "string.empty": "Box slug cannot be empty",
  }),

  description: Joi.string().trim().max(2000).optional().allow("").messages({
    "string.max": "Description cannot exceed 2000 characters",
  }),

  products: Joi.array().items(boxProductSchema).min(1).optional().messages({
    "array.min": "Box must contain at least one product",
  }),

  discount: Joi.number().min(0).max(100).precision(2).optional().messages({
    "number.base": "Discount must be a number",
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),
});

// ====================
// Box ID
// ====================

const boxIdValidationSchema = Joi.object({
  boxId: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Box ID is not valid",
    "string.empty": "Box ID cannot be empty",
    "any.required": "Box ID is required",
  }),
});

// ====================
// Thumbnail
// ====================

const updateBoxThumbnailValidationSchema = Joi.object({
  // فایل توسط multer بررسی می‌شود
}).unknown(true);

// ====================
// Images
// ====================

const updateBoxImagesValidationSchema = Joi.object({
  // فایل‌ها توسط multer بررسی می‌شوند
}).unknown(true);

module.exports = {
  addBoxValidationSchema,
  editBoxValidationSchema,
  boxIdValidationSchema,
  updateBoxThumbnailValidationSchema,
  updateBoxImagesValidationSchema,
};
