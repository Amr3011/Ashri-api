// Vercel serverless function entry point
const app = require("../src/server");

// Export the Express app directly for Vercel
module.exports = app;
