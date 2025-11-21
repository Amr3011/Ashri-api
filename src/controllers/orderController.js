const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Create order from cart with customer info
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const {
      sessionId,
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      notes,
      shippingFee = 0,
    } = req.body;

    // Validate required fields
    if (
      !sessionId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !streetAddress ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "All customer and address fields are required",
      });
    }

    // Get cart
    const cart = await Cart.findOne({
      sessionId,
      isActive: true,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Verify stock availability for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      // Find color variant
      const colorVariant = product.variants.find(
        (v) => v.color.toLowerCase() === item.color.toLowerCase()
      );

      if (!colorVariant) {
        return res.status(400).json({
          success: false,
          message: `Color ${item.color} not available for ${product.name}`,
        });
      }

      const sizeItem = colorVariant.sizes.find((s) => s.name === item.size);

      if (!sizeItem) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} not available for ${product.name} in ${item.color}`,
        });
      }

      // Check if sold out
      if (sizeItem.quantity === 0) {
        return res.status(400).json({
          success: false,
          message: `Sold Out - ${product.name} (${item.color}, ${item.size}) is out of stock`,
        });
      }

      if (sizeItem.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${item.color}, ${item.size}) - Only ${sizeItem.quantity} available`,
        });
      }
    }

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      productName: item.product.name,
      productImage: item.product.images[0],
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    // Create order
    const order = await Order.create({
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      items: orderItems,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      shippingFee,
      notes,
    });

    // Update product stock - خصم من الكمية الصحيحة
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      // Find the color variant
      const variantIndex = product.variants.findIndex(
        (v) => v.color.toLowerCase() === item.color.toLowerCase()
      );

      if (variantIndex !== -1) {
        // Find the size within that variant
        const sizeIndex = product.variants[variantIndex].sizes.findIndex(
          (s) => s.name === item.size
        );

        if (sizeIndex !== -1) {
          // Deduct the quantity
          product.variants[variantIndex].sizes[sizeIndex].quantity -=
            item.quantity;
          await product.save();
        }
      }
    }

    // Clear and deactivate cart
    cart.items = [];
    cart.isActive = false;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sortBy = "createdAt" } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    // Define sort options
    const sortOptions = {};
    if (sortBy === "createdAt") {
      sortOptions.createdAt = -1; // Newest first
    } else if (sortBy === "totalPrice") {
      sortOptions.totalPrice = -1; // Highest first
    } else if (sortBy === "orderNumber") {
      sortOptions.orderNumber = 1; // A-Z
    } else {
      sortOptions.createdAt = -1; // Default
    }

    const orders = await Order.find(query)
      .populate("items.product", "name category images")
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortOptions);

    const total = await Order.countDocuments(query);

    // Calculate statistics
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalPrice" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$finalPrice" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      statistics: stats[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      },
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get orders by email or phone
// @route   GET /api/orders/search
// @access  Public
exports.searchOrders = async (req, res) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number",
      });
    }

    const query = {};
    if (email) query.email = email.toLowerCase();
    if (phone) query.phone = phone;

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Public
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    // Update timestamps based on status
    const now = new Date();
    if (status === "confirmed") order.confirmedAt = now;
    if (status === "shipped") order.shippedAt = now;
    if (status === "delivered") order.deliveredAt = now;
    if (status === "cancelled") order.cancelledAt = now;

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Public
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order that has been shipped or delivered",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Restore product stock - رجّع الكمية للمخزون
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (product) {
        // Find the color variant
        const variantIndex = product.variants.findIndex(
          (v) => v.color.toLowerCase() === item.color.toLowerCase()
        );

        if (variantIndex !== -1) {
          // Find the size within that variant
          const sizeIndex = product.variants[variantIndex].sizes.findIndex(
            (s) => s.name === item.size
          );

          if (sizeIndex !== -1) {
            // Restore the quantity
            product.variants[variantIndex].sizes[sizeIndex].quantity +=
              item.quantity;
            await product.save();
          }
        }
      }
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
