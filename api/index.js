// Vercel serverless function entry point
const app = require("../src/server");

// Export as serverless function handler for Vercel
module.exports = (req, res) => {
  return app(req, res);
};
