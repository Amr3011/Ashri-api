const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStock,
} = require("../controllers/productController");
const upload = require("../middleware/upload");
const {
  validateProduct,
  validateObjectId,
  validateStockUpdate,
} = require("../middleware/validation");

// Public routes
router.get("/", getAllProducts);
router.get("/:id", validateObjectId, getProductById);

// Admin routes (لاحقاً هنضيف Authentication)
// In production, skip multer middleware
if (process.env.NODE_ENV === "production") {
  router.post("/", validateProduct, createProduct);
  router.put("/:id", validateObjectId, updateProduct);
} else {
  router.post("/", upload.array("images", 10), validateProduct, createProduct);
  router.put(
    "/:id",
    validateObjectId,
    upload.array("images", 10),
    updateProduct
  );
}

router.delete("/:id", validateObjectId, deleteProduct);
router.patch(
  "/:id/stock",
  validateObjectId,
  validateStockUpdate,
  updateProductStock
);

module.exports = router;
