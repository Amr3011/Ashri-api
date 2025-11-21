const Cart = require("../models/Cart");
const Product = require("../models/Product");
const crypto = require("crypto");

// Helper: Generate session ID
const generateSessionId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// @desc    Create new cart (get session ID)
// @route   POST /api/cart
// @access  Public
exports.createCart = async (req, res) => {
  try {
    const sessionId = generateSessionId();

    const cart = await Cart.create({
      sessionId,
      items: [],
    });

    res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: {
        sessionId: cart.sessionId,
        cart,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get cart by session ID
// @route   GET /api/cart/:sessionId
// @access  Public
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      sessionId: req.params.sessionId,
      isActive: true,
    }).populate("items.product");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/:sessionId/items
// @access  Public
exports.addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;

    // Get product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find the color variant
    const colorVariant = product.variants.find(
      (v) => v.color.toLowerCase() === color.toLowerCase()
    );

    if (!colorVariant) {
      return res.status(400).json({
        success: false,
        message: `Color '${color}' is not available for this product`,
      });
    }

    // Check if size is available and has stock
    const sizeItem = colorVariant.sizes.find(
      (s) => s.name === size.toUpperCase()
    );

    if (!sizeItem) {
      return res.status(400).json({
        success: false,
        message: `Size '${size}' is not available for this product`,
      });
    }

    // Check if sold out
    if (sizeItem.quantity === 0) {
      return res.status(400).json({
        success: false,
        message: `Sold Out - Size ${size} in ${color} is currently out of stock`,
      });
    }

    if (sizeItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeItem.quantity} items available in stock for size ${size} in ${color}`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({
      sessionId: req.params.sessionId,
      isActive: true,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found. Please create a new cart.",
      });
    }

    // Check if item already exists in cart (same product, size, color)
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size.toUpperCase() &&
        item.color.toLowerCase() === color.toLowerCase()
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (sizeItem.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${sizeItem.quantity} items available in stock`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        size: size.toUpperCase(),
        color,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    // Populate product details
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:sessionId/items/:itemId
// @access  Public
exports.updateCartItem = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ sessionId, isActive: true });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Check stock availability
    const product = await Product.findById(item.product);

    // Find the color variant
    const colorVariant = product.variants.find(
      (v) => v.color.toLowerCase() === item.color.toLowerCase()
    );

    if (!colorVariant) {
      return res.status(400).json({
        success: false,
        message: "Product variant not found",
      });
    }

    const sizeItem = colorVariant.sizes.find((s) => s.name === item.size);

    if (!sizeItem) {
      return res.status(400).json({
        success: false,
        message: "Product size not found",
      });
    }

    // Check if sold out
    if (sizeItem.quantity === 0) {
      return res.status(400).json({
        success: false,
        message: `Sold Out - This item is currently out of stock`,
      });
    }

    if (sizeItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeItem.quantity} items available in stock`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:sessionId/items/:itemId
// @access  Public
exports.removeFromCart = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;

    const cart = await Cart.findOne({ sessionId, isActive: true });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items.pull(itemId);
    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/:sessionId
// @access  Public
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      sessionId: req.params.sessionId,
      isActive: true,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
