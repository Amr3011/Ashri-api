const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Only load .env in development (Vercel uses environment variables)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory only in development
const uploadsDir = path.join(__dirname, "../uploads");
if (process.env.NODE_ENV !== "production") {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Uploads directory created");
  }
}

// Middleware - Use only Express built-in body parsers
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (للصور) - only in development
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(uploadsDir));
}

// Connect to MongoDB (async)
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// API Routes
app.get("/", (req, res) => {
  res.json({
    message: "🛍️ Welcome to Ashly Store API!",
    version: "3.0.0",
    status: "Running",
    flow: "Anonymous checkout - no registration required",
    endpoints: {
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/orders",
      health: "/api/health",
    },
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    database: "Connected",
  });
});

// Product Routes
app.use("/api/products", require("./routes/productRoutes"));

// Cart Routes
app.use("/api/cart", require("./routes/cartRoutes"));

// Order Routes
app.use("/api/orders", require("./routes/orderRoutes"));

// Error Handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📂 API Docs: http://localhost:${PORT}/`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`🛒 Cart API: http://localhost:${PORT}/api/cart`);
    console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`✅ Anonymous checkout flow active - no registration required`);
  });
}

module.exports = app;
