// controllers/cart-controller.js

const Cart = require("../models/cart-model");
const Product = require("../models/product-model");
const Box = require("../models/box-model");

const { AppError } = require("../utils/app-error");

// ====================
// Get Cart
// ====================

const getCart = async (req, res, next) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  await cart.populate({
    path: "items.item",
    select: "name slug sku price quantity thumbnail images isActive",
  });

  res.status(200).json({
    status: "success",
    data: { cart },
  });
};

// ====================
// Add To Cart
// ====================

const addToCart = async (req, res, next) => {
  const userId = req.user._id;

  const { itemType, item, quantity } = req.body;

  // ====================
  // Find Item
  // ====================

  let product;

  if (itemType === "Product") {
    product = await Product.findById(item);

    if (!product) {
      return next(new AppError(404, `Product (id: ${item}) not found`));
    }

    if (!product.isActive) {
      return next(new AppError(400, "This product is not active"));
    }

    if (product.quantity < quantity) {
      return next(
        new AppError(400, `Only ${product.quantity} units of this product are available`),
      );
    }
  }

  // ====================
  // Find Box
  // ====================

  if (itemType === "Box") {
    product = await Box.findById(item);

    if (!product) {
      return next(new AppError(404, `Box (id: ${item}) not found`));
    }

    if (!product.isActive) {
      return next(new AppError(400, "This box is not active"));
    }
  }

  // ====================
  // Find / Create Cart
  // ====================

  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [],
    });
  }

  // ====================
  // Check Existing Item
  // ====================

  const existingItem = cart.items.find(
    (cartItem) =>
      cartItem.itemType === itemType && cartItem.item.toString() === item.toString(),
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    // Product inventory check
    if (itemType === "Product" && product.quantity < newQuantity) {
      return next(
        new AppError(400, `Only ${product.quantity} units of this product are available`),
      );
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      itemType,
      item,
      quantity,
    });
  }

  await cart.save();

  await cart.populate({
    path: "items.item",
    select: "name slug sku price thumbnail images isActive",
  });

  res.status(200).json({
    status: "success",
    message: "Item added to cart successfully",
    data: { cart },
  });
};

module.exports = {
  getCart,
  addToCart,
};
