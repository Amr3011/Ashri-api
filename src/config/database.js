const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Don't exit process in production (Vercel serverless)
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected");
      return;
    }

    const options = {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
      socketTimeoutMS: 75000, // 75 seconds
      connectTimeoutMS: 30000,
      maxPoolSize: 10, // Connection pool
      minPoolSize: 2,
      maxIdleTimeMS: 60000, // Close idle connections after 60s
      retryWrites: true,
      retryReads: true,
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("✅ MongoDB Connected Successfully!");
    console.log("📦 Database:", mongoose.connection.name);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected! Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected successfully!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Full error:", error);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
