const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
  uploadCategoryIcon,
  changeCategoryIcon,
} = require("../controller/category-controller");

const { validator } = require("../validation/validator");
const { protect, restrictTo } = require("../controller/auth-controller");
const { asyncHandler } = require("../utils/async-handler");

const {
  editCategoryValidationSchema,
  addCategoryValidationSchema,
  categoryIdValidationSchema,
} = require("../validation/category-validator");

// ====================
// Public Routes
// ====================

// Get All
router.get("/", asyncHandler(getAllCategories));

// Get One
router.get(
  "/:categoryId",
  validator(categoryIdValidationSchema, "params"),
  asyncHandler(getCategory),
);

// ====================
// Admin Routes
// ====================

router.use(asyncHandler(protect), restrictTo("admin"));

// Add
router.post("/", validator(addCategoryValidationSchema), asyncHandler(addCategory));

// Edit
router.patch(
  "/:categoryId",
  validator(categoryIdValidationSchema, "params"),
  validator(editCategoryValidationSchema),
  asyncHandler(editCategory),
);

// Delete
router.delete(
  "/:categoryId",
  validator(categoryIdValidationSchema, "params"),
  asyncHandler(deleteCategory),
);

// Change Icon
router.patch(
  "/change-icon/:categoryId",
  validator(categoryIdValidationSchema, "params"),
  uploadCategoryIcon,
  asyncHandler(changeCategoryIcon),
);

module.exports = router;
