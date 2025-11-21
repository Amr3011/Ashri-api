const express = require("express");
const router = express.Router();
const {
  createCart,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// Create new cart (get session ID)
router.post("/", createCart);

// Get cart by session ID
router.get("/:sessionId", getCart);

// Add item to cart
router.post("/:sessionId/items", addToCart);

// Update cart item
router.put("/:sessionId/items/:itemId", updateCartItem);

// Remove item from cart
router.delete("/:sessionId/items/:itemId", removeFromCart);

// Clear cart
router.delete("/:sessionId", clearCart);

module.exports = router;
