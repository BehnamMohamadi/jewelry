const express = require("express");
const router = express.Router();

const {
  getAllSubCategories,
  getSubCategoryById,
  addSubCategory,
  editSubCategoryById,
  deleteSubCategoryById,
  uploadSubCategoryIcon,
  changeSubCategoryIcon,
} = require("../controller/subCategory-controller");

const { protect, restrictTo } = require("../controller/auth-controller");

const { asyncHandler } = require("../utils/async-handler");

const { validator } = require("../validation/validator");

const {
  addSubCategoryValidationSchema,
  editSubCategoryValidationSchema,
  subCategoryIdValidationSchema,
} = require("../validation/subCategory-validator");

// ====================
// Admin
// ====================

router.use(asyncHandler(protect), restrictTo("admin"));

// ====================
// Get All
// ====================

router.get("/", asyncHandler(getAllSubCategories));

// ====================
// Add
// ====================

router.post("/", validator(addSubCategoryValidationSchema), asyncHandler(addSubCategory));

// ====================
// Change Icon
// ====================

router.patch(
  "/change-icon/:subCategoryId",
  validator(subCategoryIdValidationSchema, "params"),
  uploadSubCategoryIcon,
  asyncHandler(changeSubCategoryIcon),
);

// ====================
// Get One
// ====================

router.get(
  "/:subCategoryId",
  validator(subCategoryIdValidationSchema, "params"),
  asyncHandler(getSubCategoryById),
);

// ====================
// Edit
// ====================

router.patch(
  "/:subCategoryId",
  validator(subCategoryIdValidationSchema, "params"),
  validator(editSubCategoryValidationSchema),
  asyncHandler(editSubCategoryById),
);

// ====================
// Delete
// ====================

router.delete(
  "/:subCategoryId",
  validator(subCategoryIdValidationSchema, "params"),
  asyncHandler(deleteSubCategoryById),
);

module.exports = router;
