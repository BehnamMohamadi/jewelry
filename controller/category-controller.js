// category-controller.js

const { join } = require("node:path");
const { access, constants, unlink } = require("node:fs/promises");

const sharp = require("sharp");

const Category = require("../models/category-model");
const SubCategory = require("../models/subCategory-model");
const Product = require("../models/product-model");

const { AppError } = require("../utils/app-error");
const { multerUpload } = require("../utils/multer-config");
const { ApiFeatures } = require("../utils/api-features");

// ====================
// Get All Categories
// ====================

const getAllCategories = async (req, res, next) => {
  const categoryModel = new ApiFeatures(Category.find({}), req.query)
    .sort()
    .filter()
    .paginate()
    .limitFields();

  const categories = await categoryModel.model;

  const totalModels = new ApiFeatures(Category.find({}), req.query).filter();

  const total = await totalModels.model;

  const { page = 1, limit = 10 } = req.query;

  res.status(200).json({
    status: "success",
    page: Number(page),
    perpage: Number(limit),
    total: total.length,
    totalPages: Math.ceil(total.length / Number(limit)),
    data: {
      categories,
    },
  });
};

// ====================
// Get Category
// ====================

const getCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError(404, `category (id: ${categoryId}) not found`));
  }

  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
};

// ====================
// Add Category
// ====================

const addCategory = async (req, res, next) => {
  const { name, code, slug, description = "", isActive = true, sortOrder = 0 } = req.body;

  // ====================
  // Check Duplicate Name
  // ====================

  const existingName = await Category.findOne({
    name,
  });

  if (existingName) {
    return next(new AppError(409, "category name already exists"));
  }

  // ====================
  // Check Duplicate Code
  // ====================

  const existingCode = await Category.findOne({
    code,
  });

  if (existingCode) {
    return next(new AppError(409, "category code already exists"));
  }

  // ====================
  // Check Duplicate Slug
  // ====================

  const existingSlug = await Category.findOne({
    slug,
  });

  if (existingSlug) {
    return next(new AppError(409, "category slug already exists"));
  }

  // ====================
  // Create Category
  // ====================

  const category = await Category.create({
    name,
    code,
    slug,
    description,
    isActive,
    sortOrder,
  });

  res.status(201).json({
    status: "success",
    data: {
      category,
    },
  });
};

// ====================
// Edit Category
// ====================

const editCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  const { name, code, slug, description, isActive, sortOrder } = req.body;

  // ====================
  // Find Category
  // ====================

  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError(404, `category (id: ${categoryId}) not found`));
  }

  // ====================
  // Check Name
  // ====================

  if (name !== undefined && name !== category.name) {
    const duplicateName = await Category.findOne({
      name,
      _id: {
        $ne: category._id,
      },
    });

    if (duplicateName) {
      return next(new AppError(409, "category name already exists"));
    }

    category.name = name;
  }

  // ====================
  // Check Code
  // ====================

  if (code !== undefined && code !== category.code) {
    const duplicateCode = await Category.findOne({
      code,
      _id: {
        $ne: category._id,
      },
    });

    if (duplicateCode) {
      return next(new AppError(409, "category code already exists"));
    }

    category.code = code;
  }

  // ====================
  // Check Slug
  // ====================

  if (slug !== undefined && slug !== category.slug) {
    const duplicateSlug = await Category.findOne({
      slug,
      _id: {
        $ne: category._id,
      },
    });

    if (duplicateSlug) {
      return next(new AppError(409, "category slug already exists"));
    }

    category.slug = slug;
  }

  // ====================
  // Other Fields
  // ====================

  if (description !== undefined) {
    category.description = description;
  }

  if (isActive !== undefined) {
    category.isActive = isActive;
  }

  if (sortOrder !== undefined) {
    category.sortOrder = sortOrder;
  }

  // ====================
  // Save
  // ====================

  await category.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      category,
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
// Delete Category
// ====================

const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  // ====================
  // Find Category
  // ====================

  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError(404, `category (id: ${categoryId}) not found`));
  }

  // ====================
  // Delete Products
  // ====================

  const products = await Product.find({
    category: category._id,
  });

  for (const product of products) {
    await Product.findByIdAndDelete(product._id);

    await deleteIcon(product.thumbnail, "product");

    if (product.images?.length) {
      for (const image of product.images) {
        await deleteIcon(image, "product");
      }
    }
  }

  // ====================
  // Delete SubCategories
  // ====================

  const subCategories = await SubCategory.find({
    category: category._id,
  });

  for (const subCategory of subCategories) {
    await SubCategory.findByIdAndDelete(subCategory._id);

    await deleteIcon(subCategory.icon, "subCategory");
  }

  // ====================
  // Delete Category
  // ====================

  await Category.findByIdAndDelete(category._id);

  await deleteIcon(category.icon, "category");

  res.status(204).send();
};

// ====================
// Upload Category Icon
// ====================

const uploadCategoryIcon = multerUpload.single("icon");

// ====================
// Resize Category Icon
// ====================

const resizeCategoryIcon = async (categoryId, file = null) => {
  if (!file) return null;

  const filename = `category-${categoryId}-${Date.now()}.jpeg`;

  const filepath = join(
    __dirname,
    `../public/images/models-images/category-images/${filename}`,
  );

  await sharp(file.buffer)
    .resize(120, 120)
    .toFormat("jpeg")
    .jpeg({
      quality: 85,
    })
    .toFile(filepath);

  return filename;
};

// ====================
// Change Category Icon
// ====================

const changeCategoryIcon = async (req, res, next) => {
  const { categoryId } = req.params;

  // ====================
  // Find Category
  // ====================

  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError(404, `category (id: ${categoryId}) not found`));
  }

  // ====================
  // Check File
  // ====================

  if (!req.file) {
    return next(new AppError(400, "Category icon is required"));
  }

  // ====================
  // Create New Icon
  // ====================

  const icon = await resizeCategoryIcon(category._id, req.file);

  // ====================
  // Delete Previous Icon
  // ====================

  if (category.icon && category.icon !== "default-icon.jpeg") {
    await deleteIcon(category.icon, "category");
  }

  // ====================
  // Save New Icon
  // ====================

  category.icon = icon;

  await category.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Category icon updated successfully",
    data: {
      category,
    },
  });
};

// ====================
// Exports
// ====================

module.exports = {
  getAllCategories,
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
  uploadCategoryIcon,
  changeCategoryIcon,
};
