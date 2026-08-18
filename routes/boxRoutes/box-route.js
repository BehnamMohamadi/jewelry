const express = require("express");

const router = express.Router();

const {
  getAllBoxes,
  getBoxById,
  addBox,
  editBox,
  deleteBox,
  uploadBoxThumbnail,
  changeBoxThumbnail,
  uploadBoxImages,
  changeBoxImages,
} = require("../../controller/box-controllers/box-controller");

const { protect, restrictTo } = require("../../controller/auth-controller");
const { asyncHandler } = require("../../utils/async-handler");

const { validator } = require("../../validation/validator");

const {
  addBoxValidationSchema,
  editBoxValidationSchema,
} = require("../../validation/box-validator");

// ====================
// Public Routes
// ====================

// Get All Boxes
router.get("/", asyncHandler(getAllBoxes));

// Get One Box
router.get("/:boxId", asyncHandler(getBoxById));

// ====================
// Admin Routes
// ====================

router.use(asyncHandler(protect), restrictTo("admin"));

// ====================
// Add Box
// ====================

router.post("/", validator(addBoxValidationSchema), asyncHandler(addBox));

// ====================
// Edit Box
// ====================

router.patch("/:boxId", validator(editBoxValidationSchema), asyncHandler(editBox));

// ====================
// Delete Box
// ====================

router.delete("/:boxId", asyncHandler(deleteBox));

// ====================
// Change Thumbnail
// ====================

router.patch("/thumbnail/:boxId", uploadBoxThumbnail, asyncHandler(changeBoxThumbnail));

// ====================
// Change Images
// ====================

router.patch("/images/:boxId", uploadBoxImages, asyncHandler(changeBoxImages));

module.exports = router;
