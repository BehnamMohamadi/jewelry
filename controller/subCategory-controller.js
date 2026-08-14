// subCategory-controller.js

const { join } = require("node:path");
const { access, constants, unlink } = require("node:fs/promises");

const sharp = require("sharp");

const SubCategory = require("../models/subCategory-model");
const Category = require("../models/category-model");
const Product = require("../models/product-model");

const { AppError } = require("../utils/app-error");
const { multerUpload } = require("../utils/multer-config");
const { ApiFeatures } = require("../utils/api-features");

// ====================
// Get All SubCategories
// ====================

const getAllSubCategories = async (req, res, next) => {
  const subCategoryModel = new ApiFeatures(SubCategory.find({}), req.query)
    .sort()
    .filter()
    .paginate()
    .limitFields();

  const subcategories = await subCategoryModel.model.populate("category");

  const totalModels = new ApiFeatures(SubCategory.find({}), req.query).filter();

  const total = await totalModels.model;

  const { page = 1, limit = 10 } = req.query;

  res.status(200).json({
    status: "success",
    page: Number(page),
    perpage: Number(limit),
    total: total.length,
    totalPages: Math.ceil(total.length / Number(limit)),
    data: {
      subcategories,
    },
  });
};

// ====================
// Get SubCategory
// ====================

const getSubCategoryById = async (req, res, next) => {
  const { subCategoryId } = req.params;

  const subcategory = await SubCategory.findById(subCategoryId).populate("category");

  if (!subcategory) {
    return next(new AppError(404, `subcategory (id: ${subCategoryId}) not found`));
  }

  res.status(200).json({
    status: "success",
    data: {
      subcategory,
    },
  });
};

// ====================
// Add SubCategory
// ====================

const addSubCategory = async (req, res, next) => {
  const {
    name,
    slug,
    category,
    description = "",
    isActive = true,
    sortOrder = 0,
  } = req.body;

  // ====================
  // Check Category
  // ====================

  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    return next(new AppError(404, `category (id: ${category}) not found`));
  }

  // ====================
  // Check Duplicate Name
  // ====================

  const existingName = await SubCategory.findOne({ name });

  if (existingName) {
    return next(new AppError(409, "subcategory name already exists"));
  }

  // ====================
  // Check Duplicate Slug
  // ====================

  const existingSlug = await SubCategory.findOne({ slug });

  if (existingSlug) {
    return next(new AppError(409, "subcategory slug already exists"));
  }

  // ====================
  // Create
  // ====================

  const subcategory = await SubCategory.create({
    name,
    slug,
    category,
    description,
    isActive,
    sortOrder,
  });

  res.status(201).json({
    status: "success",
    data: {
      subcategory,
    },
  });
};

// ====================
// Edit SubCategory
// ====================

const editSubCategoryById = async (req, res, next) => {
  const { subCategoryId } = req.params;

  const { name, slug, category, description, isActive, sortOrder } = req.body;

  // ====================
  // Find SubCategory
  // ====================

  const subcategory = await SubCategory.findById(subCategoryId);

  if (!subcategory) {
    return next(new AppError(404, `subcategory (id: ${subCategoryId}) not found`));
  }

  // ====================
  // Check Duplicate Name
  // ====================

  if (name !== undefined && name !== subcategory.name) {
    const duplicateName = await SubCategory.findOne({
      name,
      _id: {
        $ne: subcategory._id,
      },
    });

    if (duplicateName) {
      return next(new AppError(409, "subcategory name already exists"));
    }

    subcategory.name = name;
  }

  // ====================
  // Check Duplicate Slug
  // ====================

  if (slug !== undefined && slug !== subcategory.slug) {
    const duplicateSlug = await SubCategory.findOne({
      slug,
      _id: {
        $ne: subcategory._id,
      },
    });

    if (duplicateSlug) {
      return next(new AppError(409, "subcategory slug already exists"));
    }

    subcategory.slug = slug;
  }

  // ====================
  // Check Category
  // ====================

  if (category !== undefined && category !== subcategory.category.toString()) {
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return next(new AppError(404, `category (id: ${category}) not found`));
    }

    subcategory.category = category;
  }

  // ====================
  // Update Fields
  // ====================

  if (description !== undefined) {
    subcategory.description = description;
  }

  if (isActive !== undefined) {
    subcategory.isActive = isActive;
  }

  if (sortOrder !== undefined) {
    subcategory.sortOrder = sortOrder;
  }

  // ====================
  // Save
  // ====================

  await subcategory.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      subcategory,
    },
  });
};

// ====================
// Delete Icon
// ====================

const deleteIcon = async (icon, modelName) => {
  if (!icon || icon === "default-icon.jpeg") {
    return;
  }

  const path = join(
    __dirname,
    `../public/images/models-images/${modelName}-images/${icon}`,
  );

  try {
    await access(path, constants.F_OK);

    await unlink(path);
  } catch (err) {
    console.error(`Failed to delete ${modelName} icon:`, err.message);
  }
};

// ====================
// Delete SubCategory
// ====================

const deleteSubCategoryById = async (req, res, next) => {
  const { subCategoryId } = req.params;

  // ====================
  // Find SubCategory
  // ====================

  const subcategory = await SubCategory.findById(subCategoryId);

  if (!subcategory) {
    return next(new AppError(404, `subcategory (id: ${subCategoryId}) not found`));
  }

  // ====================
  // Delete Products
  // ====================

  const products = await Product.find({
    subCategory: subCategoryId,
  });

  for (const product of products) {
    await Product.findByIdAndDelete(product._id);

    await deleteIcon(product.icon, "product");
  }

  // ====================
  // Delete SubCategory
  // ====================

  await SubCategory.findByIdAndDelete(subCategoryId);

  // ====================
  // Delete SubCategory Icon
  // ====================

  await deleteIcon(subcategory.icon, "subCategory");

  res.status(204).send();
};

// ====================
// Upload SubCategory Icon
// ====================

const uploadSubCategoryIcon = multerUpload.single("icon");

// ====================
// Resize SubCategory Icon
// ====================

const resizeSubCategoryIcon = async (subCategoryId, file = null) => {
  if (!file) return null;

  const filename = `subcategory-${subCategoryId}-${Date.now()}.jpeg`;

  const filepath = join(
    __dirname,
    `../public/images/models-images/subCategory-images/${filename}`,
  );

  await sharp(file.buffer)
    .resize(100, 100)
    .toFormat("jpeg")
    .jpeg({
      quality: 85,
    })
    .toFile(filepath);

  return filename;
};

// ====================
// Change SubCategory Icon
// ====================

const changeSubCategoryIcon = async (req, res, next) => {
  const { subCategoryId } = req.params;

  // ====================
  // Find SubCategory
  // ====================

  const subcategory = await SubCategory.findById(subCategoryId);

  if (!subcategory) {
    return next(new AppError(404, `subcategory (id: ${subCategoryId}) not found`));
  }

  // ====================
  // Check File
  // ====================

  if (!req.file) {
    return next(new AppError(400, "Subcategory icon is required"));
  }

  // ====================
  // Create New Icon
  // ====================

  const icon = await resizeSubCategoryIcon(subcategory._id, req.file);

  // ====================
  // Delete Previous Icon
  // ====================

  if (subcategory.icon && subcategory.icon !== "default-icon.jpeg") {
    await deleteIcon(subcategory.icon, "subCategory");
  }

  // ====================
  // Save New Icon
  // ====================

  subcategory.icon = icon;

  await subcategory.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Subcategory icon updated successfully",
    data: {
      subcategory,
    },
  });
};

// ====================
// Exports
// ====================

module.exports = {
  getAllSubCategories,
  getSubCategoryById,
  addSubCategory,
  editSubCategoryById,
  deleteSubCategoryById,
  uploadSubCategoryIcon,
  changeSubCategoryIcon,
};
