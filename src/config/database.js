const mongoose = require("mongoose");
require("dotenv").config();

let isConnecting = false;

const connectDB = async () => {
  try {
    // Don't exit process in production (Vercel serverless)
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected");
      return;
    }

    if (isConnecting) {
      console.log("⏳ Connection already in progress...");
      return;
    }

    isConnecting = true;

    const options = {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
      socketTimeoutMS: 0, // Disable socket timeout (no auto-close)
      connectTimeoutMS: 30000,
      maxPoolSize: 10, // Connection pool
      minPoolSize: 2,
      maxIdleTimeMS: 300000, // 5 minutes instead of 1 minute
      retryWrites: true,
      retryReads: true,
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
      family: 4, // Use IPv4, skip trying IPv6
      autoIndex: true,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    isConnecting = false;

    console.log("✅ MongoDB Connected Successfully!");
    console.log("📦 Database:", mongoose.connection.name);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected! Attempting to reconnect...");
      isConnecting = false;
      // Auto reconnect after 5 seconds
      setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
          console.log("🔄 Attempting to reconnect to MongoDB...");
          connectDB().catch((err) =>
            console.error("Reconnection failed:", err)
          );
        }
      }, 5000);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected successfully!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
      isConnecting = false;
    });

    mongoose.connection.on("connected", () => {
      console.log("🔗 MongoDB connected event fired");
    });

    // Keep connection alive with periodic ping
    setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.db.admin().ping();
          console.log("💓 MongoDB keepalive ping successful");
        } catch (error) {
          console.error("❌ Keepalive ping failed:", error.message);
        }
      }
    }, 240000); // Ping every 4 minutes (240 seconds)
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Full error:", error);
    isConnecting = false;

    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
