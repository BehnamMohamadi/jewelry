// utils/validations/category-validator.js
const Joi = require("joi");
const { isSlug } = require("validator");

// ====================
// Add Category Validation
// ====================

const addCategoryValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Category name must be at least 2 characters long",
    "string.max": "Category name cannot exceed 50 characters",
    "string.empty": "Category name cannot be empty",
    "any.required": "Category name is required",
  }),
  code: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Category name must be at least 2 characters long",
    "string.max": "Category name cannot exceed 50 characters",
    "string.empty": "Category name cannot be empty",
    "any.required": "Category name is required",
  }),
  description: Joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  slug: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Category slug must be at least 2 characters long",
    "string.max": "Category slug cannot exceed 50 characters",
    "string.empty": "Category slug cannot be empty",
    "any.required": "Category slug is required",
  }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),

  sortOrder: Joi.number().integer().min(0).optional().messages({
    "number.base": "sortOrder must be a number",
    "number.integer": "sortOrder must be an integer",
    "number.min": "sortOrder cannot be negative",
  }),

  icon: Joi.string().trim().optional().allow("").messages({
    "string.base": "Icon must be a string",
  }),
});

// ====================
// Edit Category Validation
// ====================

const editCategoryValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().optional().messages({
    "string.min": "Category name must be at least 2 characters long",
    "string.max": "Category name cannot exceed 50 characters",
    "string.empty": "Category name cannot be empty",
  }),
  code: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Category name must be at least 2 characters long",
    "string.max": "Category name cannot exceed 50 characters",
    "string.empty": "Category name cannot be empty",
    "any.required": "Category name is required",
  }),
  slug: Joi.string().min(2).max(50).trim().lowercase().optional().messages({
    "string.min": "Category slug must be at least 2 characters long",
    "string.max": "Category slug cannot exceed 50 characters",
    "string.empty": "Category slug cannot be empty",
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
// Change Category Icon Validation
// ====================

const changeCategoryIconValidationSchema = Joi.object({
  categoryName: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Category name must be at least 2 characters long",
    "string.max": "Category name cannot exceed 50 characters",
    "string.empty": "Category name cannot be empty",
    "any.required": "Category name is required",
  }),
});

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const categoryIdValidationSchema = Joi.object({
  categoryId: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid category id",
    "string.empty": "Category id cannot be empty",
    "any.required": "Category id is required",
  }),
});

module.exports = {
  addCategoryValidationSchema,
  editCategoryValidationSchema,
  changeCategoryIconValidationSchema,
  categoryIdValidationSchema,
};
