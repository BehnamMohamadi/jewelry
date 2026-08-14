// ====================
// box-controller.js
// ====================

const { join } = require("node:path");
const { access, constants, unlink } = require("node:fs/promises");

const sharp = require("sharp");

const Box = require("../../models/box-model");
const Product = require("../../models/product-model");

const { AppError } = require("../../utils/app-error");
const { multerUpload } = require("../../utils/multer-config");
const { ApiFeatures } = require("../../utils/api-features");

// ====================
// Get All Boxes
// ====================

const getAllBoxes = async (req, res, next) => {
  const boxModel = new ApiFeatures(Box.find({}), req.query)
    .sort()
    .filter()
    .paginate()
    .limitFields();

  const boxes = await boxModel.model.populate("products.product");

  const totalModels = new ApiFeatures(Box.find({}), req.query).filter();

  const total = await totalModels.model;

  const { page = 1, limit = 10 } = req.query;

  res.status(200).json({
    status: "success",
    page: Number(page),
    perpage: Number(limit),
    total: total.length,
    totalPages: Math.ceil(total.length / Number(limit)),
    data: {
      boxes,
    },
  });
};

// ====================
// Get Box By ID
// ====================

const getBoxById = async (req, res, next) => {
  const { boxId } = req.params;

  const box = await Box.findById(boxId).populate("products.product");

  if (!box) {
    return next(new AppError(404, `box (id: ${boxId}) not found`));
  }

  res.status(200).json({
    status: "success",
    data: {
      box,
    },
  });
};

// ====================
// Validate Box Products
// ====================

const validateBoxProducts = async (products) => {
  if (!products || !products.length) {
    throw new AppError(400, "Box must contain at least one product");
  }

  const productIds = products.map((item) => item.product.toString());

  // جلوگیری از محصول تکراری
  const uniqueProductIds = new Set(productIds);

  if (uniqueProductIds.size !== productIds.length) {
    throw new AppError(409, "A product cannot be added to a box more than once");
  }

  // پیدا کردن محصولات
  const existingProducts = await Product.find({
    _id: {
      $in: productIds,
    },
  }).select("_id quantity isActive");

  if (existingProducts.length !== productIds.length) {
    throw new AppError(400, "One or more products were not found");
  }

  // بررسی موجود بودن / فعال بودن محصول
  for (const item of products) {
    const product = existingProducts.find(
      (p) => p._id.toString() === item.product.toString(),
    );

    if (!product) {
      throw new AppError(400, `Product (id: ${item.product}) not found`);
    }

    if (!product.isActive) {
      throw new AppError(400, `Product (id: ${item.product}) is inactive`);
    }

    if (item.quantity > product.quantity) {
      throw new AppError(
        400,
        `Requested quantity for product (id: ${item.product}) exceeds available stock`,
      );
    }
  }

  return true;
};

// ====================
// Add Box
// ====================

const addBox = async (req, res, next) => {
  const {
    name,
    slug,
    description = "",
    products,
    discount = 0,
    isActive = true,
  } = req.body;

  // بررسی نام
  const duplicateName = await Box.findOne({
    name,
  });

  if (duplicateName) {
    return next(new AppError(409, "Box name already exists"));
  }

  // بررسی slug
  const duplicateSlug = await Box.findOne({
    slug,
  });

  if (duplicateSlug) {
    return next(new AppError(409, "Box slug already exists"));
  }

  // بررسی محصولات
  await validateBoxProducts(products);

  const box = await Box.create({
    name,
    slug,
    description,
    products,
    discount,
    isActive,
  });

  // برای برگرداندن قیمت‌ها باید populate کنیم
  await box.populate("products.product");

  res.status(201).json({
    status: "success",
    data: {
      box,
    },
  });
};

// ====================
// Edit Box
// ====================

const editBox = async (req, res, next) => {
  const { boxId } = req.params;

  const { name, slug, description, products, discount, isActive } = req.body;

  const box = await Box.findById(boxId);

  if (!box) {
    return next(new AppError(404, `box (id: ${boxId}) not found`));
  }

  // ====================
  // Name
  // ====================

  if (name !== undefined && name !== box.name) {
    const duplicateName = await Box.findOne({
      name,
      _id: {
        $ne: boxId,
      },
    });

    if (duplicateName) {
      return next(new AppError(409, "Box name already exists"));
    }

    box.name = name;
  }

  // ====================
  // Slug
  // ====================

  if (slug !== undefined && slug !== box.slug) {
    const duplicateSlug = await Box.findOne({
      slug,
      _id: {
        $ne: boxId,
      },
    });

    if (duplicateSlug) {
      return next(new AppError(409, "Box slug already exists"));
    }

    box.slug = slug;
  }

  // ====================
  // Products
  // ====================

  if (products !== undefined) {
    await validateBoxProducts(products);

    box.products = products;
  }

  // ====================
  // Other Fields
  // ====================

  if (description !== undefined) {
    box.description = description;
  }

  if (discount !== undefined) {
    box.discount = discount;
  }

  if (isActive !== undefined) {
    box.isActive = isActive;
  }

  await box.save({
    validateModifiedOnly: true,
  });

  await box.populate("products.product");

  res.status(200).json({
    status: "success",
    data: {
      box,
    },
  });
};

// ====================
// Delete Box
// ====================

const deleteBox = async (req, res, next) => {
  const { boxId } = req.params;

  const box = await Box.findByIdAndDelete(boxId);

  if (!box) {
    return next(new AppError(404, `box (id: ${boxId}) not found`));
  }

  // حذف Thumbnail
  await deleteBoxImage(box.thumbnail, "thumbnail");

  // حذف Images
  if (box.images && box.images.length) {
    for (const image of box.images) {
      await deleteBoxImage(image, "image");
    }
  }

  res.status(204).send();
};

// ====================
// Delete Box Image
// ====================

const deleteBoxImage = async (filename, type) => {
  if (!filename) return;

  if (filename === "default-thumbnail.jpeg") {
    return;
  }

  const folder = type === "thumbnail" ? "box-thumbnails" : "box-images";

  const filepath = join(
    __dirname,
    `../public/images/models-images/${folder}/${filename}`,
  );

  try {
    await access(filepath, constants.F_OK);

    await unlink(filepath);
  } catch (err) {
    console.error(`Failed to delete box ${type}:`, err.message);
  }
};

// ====================
// Upload Thumbnail
// ====================

const uploadBoxThumbnail = multerUpload.single("thumbnail");

// ====================
// Resize Thumbnail
// ====================

const resizeBoxThumbnail = async (boxId, file) => {
  const filename = `box-thumbnail-${boxId}-${Date.now()}.jpeg`;

  const filepath = join(
    __dirname,
    `../public/images/models-images/box-thumbnails/${filename}`,
  );

  await sharp(file.buffer)
    .resize(500, 500)
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

const changeBoxThumbnail = async (req, res, next) => {
  const { boxId } = req.params;

  const box = await Box.findById(boxId);

  if (!box) {
    return next(new AppError(404, `box (id: ${boxId}) not found`));
  }

  if (!req.file) {
    return next(new AppError(400, "Box thumbnail is required"));
  }

  const thumbnail = await resizeBoxThumbnail(box._id, req.file);

  // حذف Thumbnail قبلی
  if (box.thumbnail && box.thumbnail !== "default-thumbnail.jpeg") {
    await deleteBoxImage(box.thumbnail, "thumbnail");
  }

  box.thumbnail = thumbnail;

  await box.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Box thumbnail updated successfully",
    data: {
      box,
    },
  });
};

// ====================
// Upload Images
// ====================

const uploadBoxImages = multerUpload.array("images", 10);

// ====================
// Resize Images
// ====================

const resizeBoxImages = async (boxId, files) => {
  const filenames = [];

  for (const file of files) {
    const filename = `box-${boxId}-${Date.now()}-${Math.round(Math.random() * 100000)}.jpeg`;

    const filepath = join(
      __dirname,
      `../public/images/models-images/box-images/${filename}`,
    );

    await sharp(file.buffer)
      .resize(1000, 1000, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("jpeg")
      .jpeg({
        quality: 85,
      })
      .toFile(filepath);

    filenames.push(filename);
  }

  return filenames;
};

// ====================
// Change Images
// ====================

const changeBoxImages = async (req, res, next) => {
  const { boxId } = req.params;

  const box = await Box.findById(boxId);

  if (!box) {
    return next(new AppError(404, `box (id: ${boxId}) not found`));
  }

  if (!req.files || !req.files.length) {
    return next(new AppError(400, "At least one image is required"));
  }

  const images = await resizeBoxImages(box._id, req.files);

  // حذف تمام تصاویر قبلی
  if (box.images && box.images.length) {
    for (const image of box.images) {
      await deleteBoxImage(image, "image");
    }
  }

  // جایگزینی کل آرایه
  box.images = images;

  await box.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Box images updated successfully",
    data: {
      box,
    },
  });
};

// ====================
// Exports
// ====================

module.exports = {
  getAllBoxes,
  getBoxById,
  addBox,
  editBox,
  deleteBox,

  uploadBoxThumbnail,
  changeBoxThumbnail,

  uploadBoxImages,
  changeBoxImages,
};
