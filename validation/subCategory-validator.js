// utils/validations/subCategory-validator.js

const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// ====================
// Add SubCategory
// ====================

const addSubCategoryValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Subcategory name must be at least 2 characters long",
    "string.max": "Subcategory name cannot exceed 50 characters",
    "string.empty": "Subcategory name cannot be empty",
    "any.required": "Subcategory name is required",
  }),

  slug: Joi.string().min(2).max(50).trim().lowercase().required().messages({
    "string.min": "Subcategory slug must be at least 2 characters long",
    "string.max": "Subcategory slug cannot exceed 50 characters",
    "string.empty": "Subcategory slug cannot be empty",
    "any.required": "Subcategory slug is required",
  }),

  category: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid category id",
    "string.empty": "Category id cannot be empty",
    "any.required": "Category is required",
  }),

  description: Joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Description cannot exceed 500 characters",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),

  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.base": "sortOrder must be a number",
    "number.integer": "sortOrder must be an integer",
    "number.min": "sortOrder cannot be negative",
  }),
});

// ====================
// Edit SubCategory
// ====================

const editSubCategoryValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().optional().messages({
    "string.min": "Subcategory name must be at least 2 characters long",
    "string.max": "Subcategory name cannot exceed 50 characters",
    "string.empty": "Subcategory name cannot be empty",
  }),

  slug: Joi.string().min(2).max(50).trim().lowercase().optional().messages({
    "string.min": "Subcategory slug must be at least 2 characters long",
    "string.max": "Subcategory slug cannot exceed 50 characters",
    "string.empty": "Subcategory slug cannot be empty",
  }),

  category: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "Invalid category id",
  }),

  description: Joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Description cannot exceed 500 characters",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),

  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.base": "sortOrder must be a number",
    "number.integer": "sortOrder must be an integer",
    "number.min": "sortOrder cannot be negative",
  }),
});

// ====================
// SubCategory ID
// ====================

const subCategoryIdValidationSchema = Joi.object({
  subCategoryId: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid subcategory id",
    "string.empty": "Subcategory id cannot be empty",
    "any.required": "Subcategory id is required",
  }),
});

// ====================
// Export
// ====================

module.exports = {
  addSubCategoryValidationSchema,
  editSubCategoryValidationSchema,
  subCategoryIdValidationSchema,
};
