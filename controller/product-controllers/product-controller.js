// controllers/product-controller.js

const Product = require("../../models/product-model");
const Category = require("../../models/category-model");
const SubCategory = require("../../models/subCategory-model");

const { AppError } = require("../../utils/app-error");
const { ApiFeatures } = require("../../utils/api-features");
const { multerUpload } = require("../../utils/multer-config");

const { join } = require("node:path");
const { access, constants, unlink, mkdir } = require("node:fs/promises");

const sharp = require("sharp");

// ====================
// Get All Products
// ====================

const getAllProducts = async (req, res, next) => {
  const productModel = new ApiFeatures(Product.find({}), req.query)
    .sort()
    .filter()
    .paginate()
    .limitFields();

  const products = await productModel.model
    .populate("category", "name slug icon")
    .populate("subCategory", "name slug");

  const totalModels = new ApiFeatures(Product.find({}), req.query).filter();

  const total = await totalModels.model;

  const { page = 1, limit = 10 } = req.query;

  res.status(200).json({
    status: "success",
    page: Number(page),
    perpage: Number(limit),
    total: total.length,
    totalPages: Math.ceil(total.length / Number(limit)),
    data: {
      products,
    },
  });
};

// ====================
// Get Product By ID
// ====================

const getProductById = async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId)
    .populate("category", "name slug icon")
    .populate("subCategory", "name slug");

  if (!product) {
    return next(new AppError(404, `product (id: ${productId}) not found`));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
};

// ====================
// Add Product
// ====================

const addProduct = async (req, res, next) => {
  const {
    name,
    slug,
    category,
    subCategory,
    gender,
    price,
    quantity,
    brand,
    description,
    isActive = true,
  } = req.body;

  // ====================
  // Duplicate Name
  // ====================

  const duplicateName = await Product.findOne({ name });

  if (duplicateName) {
    return next(new AppError(409, "Product name already exists"));
  }

  // ====================
  // Duplicate Slug
  // ====================

  const duplicateSlug = await Product.findOne({ slug });

  if (duplicateSlug) {
    return next(new AppError(409, "Product slug already exists"));
  }

  // ====================
  // Check Category
  // ====================

  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    return next(new AppError(404, `category (id: ${category}) not found`));
  }

  // ====================
  // Check SubCategory
  // ====================

  const subCategoryExists = await SubCategory.findById(subCategory);
  console.log(subCategory);
  if (!subCategoryExists) {
    return next(new AppError(404, `subcategory (id: ${subCategory}) not found`));
  }

  // ====================
  // Check Category / SubCategory Relation
  // ====================

  if (subCategoryExists.category.toString() !== category.toString()) {
    return next(
      new AppError(409, "SubCategory does not belong to the selected Category"),
    );
  }

  // ====================
  // Create Product
  // ====================
  // SKU عمداً اینجا ارسال نمی‌شود.
  // Hook مدل آن را تولید می‌کند.

  const product = await Product.create({
    name,
    slug,
    category,
    subCategory,
    gender,
    price,
    quantity,
    brand,
    description,
    isActive,
  });

  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
};

// ====================
// Edit Product
// ====================

const editProduct = async (req, res, next) => {
  const { productId } = req.params;

  const {
    name,
    slug,
    category,
    subCategory,
    gender,
    price,
    quantity,
    brand,
    description,
    isActive,
  } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError(404, `product (id: ${productId}) not found`));
  }

  // ====================
  // Duplicate Name
  // ====================

  if (name && name !== product.name) {
    const duplicateName = await Product.findOne({
      name,
      _id: { $ne: product._id },
    });

    if (duplicateName) {
      return next(new AppError(409, "Product name already exists"));
    }

    product.name = name;
  }

  // ====================
  // Duplicate Slug
  // ====================

  if (slug && slug !== product.slug) {
    const duplicateSlug = await Product.findOne({
      slug,
      _id: { $ne: product._id },
    });

    if (duplicateSlug) {
      return next(new AppError(409, "Product slug already exists"));
    }

    product.slug = slug;
  }

  // ====================
  // Check Category
  // ====================

  if (category) {
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return next(new AppError(404, `category (id: ${category}) not found`));
    }

    product.category = category;
  }

  // ====================
  // Check SubCategory
  // ====================

  if (subCategory) {
    const subCategoryExists = await SubCategory.findById(subCategory);

    if (!subCategoryExists) {
      return next(new AppError(404, `subcategory (id: ${subCategory}) not found`));
    }

    product.subCategory = subCategory;
  }

  // ====================
  // Check Category / SubCategory Relation
  // ====================

  const finalCategory = category ?? product.category;

  const finalSubCategory = subCategory ?? product.subCategory;

  const subCategoryExists = await SubCategory.findById(finalSubCategory);

  if (subCategoryExists.category.toString() !== finalCategory.toString()) {
    return next(
      new AppError(409, "SubCategory does not belong to the selected Category"),
    );
  }

  // ====================
  // Other Fields
  // ====================

  if (gender !== undefined) {
    product.gender = gender;
  }

  if (price !== undefined) {
    product.price = price;
  }

  if (quantity !== undefined) {
    product.quantity = quantity;
  }

  if (brand !== undefined) {
    product.brand = brand;
  }

  if (description !== undefined) {
    product.description = description;
  }

  if (isActive !== undefined) {
    product.isActive = isActive;
  }

  // ====================
  // Save
  // ====================

  await product.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
};

// ====================
// Delete Product
// ====================

const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    return next(new AppError(404, `product (id: ${productId}) not found`));
  }

  // Delete thumbnail
  if (product.thumbnail && product.thumbnail !== "default-thumbnail.jpeg") {
    await deleteProductImage(product.thumbnail);
  }

  // Delete all product images
  if (product.images?.length) {
    for (const image of product.images) {
      await deleteProductImage(image);
    }
  }

  res.status(204).send();
};

// ==================================================
// PRODUCT THUMBNAIL
// ==================================================

// ====================
// Upload Thumbnail
// ====================

const uploadProductThumbnail = multerUpload.single("thumbnail");

// ====================
// Resize Thumbnail
// ====================

const resizeProductThumbnail = async (productId, file) => {
  const directory = join(__dirname, "../../public/images/models-images/product-images");

  await mkdir(directory, {
    recursive: true,
  });

  const filename = `thumbnail-${productId}-${Date.now()}.jpeg`;

  const filepath = join(directory, filename);

  await sharp(file.buffer)
    .resize(800, 800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat("jpeg")
    .jpeg({
      quality: 85,
    })
    .toFile(filepath);

  return filename;
};

// ====================
// Change Thumbnail
// ====================

const changeProductThumbnail = async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError(404, `product (id: ${productId}) not found`));
  }

  if (!req.file) {
    return next(new AppError(400, "Product thumbnail is required"));
  }

  const thumbnail = await resizeProductThumbnail(product._id, req.file);

  // Delete previous thumbnail
  if (product.thumbnail && product.thumbnail !== "default-thumbnail.jpeg") {
    await deleteProductImage(product.thumbnail);
  }

  product.thumbnail = thumbnail;

  await product.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Product thumbnail updated successfully",
    data: {
      product,
    },
  });
};

// ==================================================
// PRODUCT IMAGES
// ==================================================

// ====================
// Upload Product Images
// ====================

const uploadProductImages = multerUpload.array("images", 10);

// ====================
// Resize Product Image
// ====================

const resizeProductImage = async (productId, file, index) => {
  const directory = join(__dirname, "../../public/images/models-images/product-images");

  await mkdir(directory, {
    recursive: true,
  });

  const filename = `product-${productId}-${Date.now()}-${index}.jpeg`;

  const filepath = join(directory, filename);

  await sharp(file.buffer)
    .resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat("jpeg")
    .jpeg({
      quality: 85,
    })
    .toFile(filepath);

  return filename;
};

// ====================
// Delete Product Image
// ====================

const deleteProductImage = async (filename) => {
  if (!filename || filename === "default-thumbnail.jpeg") {
    return;
  }

  const filepath = join(
    __dirname,
    "../../public/images/models-images/product-images",
    filename,
  );

  try {
    await access(filepath, constants.F_OK);

    await unlink(filepath);
  } catch (err) {
    console.error(`Failed to delete product image: ${filename}`, err.message);
  }
};

// ====================
// Update Product Images
// ====================

const updateProductImages = async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError(404, `product (id: ${productId}) not found`));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError(400, "At least one product image is required"));
  }

  // ====================
  // Delete Previous Images
  // ====================

  if (product.images?.length) {
    for (const image of product.images) {
      await deleteProductImage(image);
    }
  }

  // ====================
  // Save New Images
  // ====================

  const images = [];

  for (let i = 0; i < req.files.length; i++) {
    const filename = await resizeProductImage(product._id, req.files[i], i + 1);

    images.push(filename);
  }

  // ====================
  // Update Product
  // ====================

  product.images = images;

  await product.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Product images updated successfully",
    data: {
      product,
    },
  });
};

// ====================
// Exports
// ====================

module.exports = {
  getAllProducts,
  getProductById,

  addProduct,
  editProduct,
  deleteProduct,

  uploadProductThumbnail,
  changeProductThumbnail,

  uploadProductImages,
  updateProductImages,
};
