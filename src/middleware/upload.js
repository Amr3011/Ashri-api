const multer = require("multer");
const path = require("path");

// In production (Vercel), create a dummy middleware that skips file upload
if (process.env.NODE_ENV === "production") {
  // Export a dummy middleware that just passes through
  module.exports = {
    array: (fieldName, maxCount) => {
      return (req, res, next) => {
        // Set empty files array and continue
        req.files = [];
        next();
      };
    },
    single: (fieldName) => {
      return (req, res, next) => {
        req.file = null;
        next();
      };
    },
  };
} else {
  // Development: Normal file upload
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  };

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: fileFilter,
  });

  module.exports = upload;
}
