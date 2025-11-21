const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  searchOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");
const { validateObjectId } = require("../middleware/validation");

// Create order
router.post("/", createOrder);

// Get all orders (Admin)
router.get("/", getAllOrders);

// Search orders by email or phone
router.get("/search", searchOrders);

// Get order by ID
router.get("/:id", validateObjectId, getOrderById);

// Update order status (Admin)
router.patch("/:id/status", validateObjectId, updateOrderStatus);

// Cancel order
router.patch("/:id/cancel", validateObjectId, cancelOrder);

module.exports = router;
