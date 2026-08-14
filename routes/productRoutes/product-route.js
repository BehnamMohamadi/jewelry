// routes/product-route.js

const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,

  uploadProductThumbnail,
  changeProductThumbnail,

  uploadProductImages,
  updateProductImages,
} = require("../../controller/product-controllers/product-controller");

const { protect, restrictTo } = require("../../controller/auth-controller");
const { asyncHandler } = require("../../utils/async-handler");
const { validator } = require("../../validation/validator");

const {
  addProductValidationSchema,
  editProductValidationSchema,
  updateProductImagesValidationSchema,
  updateProductThumbnailValidationSchema,
} = require("../../validation/product-validator");

// ====================
// Public Routes
// ====================

// Get All Products
// امکان filter / sort / pagination از طریق query
router.get("/", asyncHandler(getAllProducts));

// Get Product By ID
router.get("/:productId", asyncHandler(getProductById));

// ====================
// Admin Routes
// ====================

router.use(asyncHandler(protect), restrictTo("admin"));

// ====================
// Product CRUD
// ====================

// Add Product
router.post("/", validator(addProductValidationSchema), asyncHandler(addProduct));

// Edit Product
router.patch(
  "/:productId",
  validator(editProductValidationSchema),
  asyncHandler(editProduct),
);

// Delete Product
router.delete("/:productId", asyncHandler(deleteProduct));

// ====================
// Product Thumbnail
// ====================

// Change Product Thumbnail
router.patch(
  "/thumbnail/:productId",
  uploadProductThumbnail,
  validator(updateProductThumbnailValidationSchema, "file"),
  asyncHandler(changeProductThumbnail),
);
// ====================
// Product Images
// ====================

// Replace All Product Images
router.patch(
  "/images/:productId",
  uploadProductImages,
  validator(updateProductImagesValidationSchema, "files"),
  asyncHandler(updateProductImages),
);

module.exports = router;
