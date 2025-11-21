/**
 * Application Constants
 */

// Product Categories
const PRODUCT_CATEGORIES = [
  "T-Shirt",
  "Sweatshirt",
  "Hoodie",
  "Pants",
  "Jeans",
  "Shorts",
  "Jacket",
  "Other",
];

// Available Sizes - Fixed sizes for all products
const PRODUCT_SIZES = ["M", "L", "XL", "XXL"];

// File Upload Settings
const UPLOAD_SETTINGS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10,
  allowedFormats: ["jpeg", "jpg", "png", "gif", "webp"],
  uploadPath: "uploads/",
};

// Pagination Defaults
const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
};

// API Messages
const MESSAGES = {
  // Success
  PRODUCT_CREATED: "Product created successfully",
  PRODUCT_UPDATED: "Product updated successfully",
  PRODUCT_DELETED: "Product deleted successfully",
  STOCK_UPDATED: "Stock updated successfully",

  // Errors
  PRODUCT_NOT_FOUND: "Product not found",
  INVALID_ID: "Invalid product ID format",
  VALIDATION_ERROR: "Validation failed",
  SERVER_ERROR: "Server error occurred",
  IMAGE_REQUIRED: "At least one image is required",

  // Database
  DB_CONNECTED: "MongoDB Connected Successfully",
  DB_ERROR: "MongoDB Connection Error",

  // Server
  SERVER_RUNNING: "Server is running",
  API_HEALTHY: "API is healthy",
};

module.exports = {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  UPLOAD_SETTINGS,
  PAGINATION,
  MESSAGES,
};
