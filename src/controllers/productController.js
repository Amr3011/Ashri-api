const Product = require("../models/Product");
const fs = require("fs").promises;
const path = require("path");

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, oldPrice, variants } = req.body;

    console.log("Received body:", req.body);
    console.log("Variants type:", typeof variants);
    console.log("Variants value:", variants);

    // Get uploaded images paths or use imageUrls
    let images = [];

    // Check for imageUrls first (works in both dev and production)
    if (req.body.imageUrls && req.body.imageUrls.length > 0) {
      images = req.body.imageUrls;
    }
    // Fallback to uploaded files in development
    else if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one image is required. Provide 'imageUrls' array with image links.",
      });
    }

    // Parse variants if it comes as string
    let parsedVariants;
    try {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid variants format. Must be valid JSON.",
        error: parseError.message,
      });
    }

    console.log("Parsed variants:", parsedVariants);

    // Validate and structure variants
    if (!parsedVariants || parsedVariants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one color variant is required",
      });
    }

    // Ensure each variant has all sizes (M, L, XL, XXL)
    const defaultSizes = [
      { name: "M", quantity: 0 },
      { name: "L", quantity: 0 },
      { name: "XL", quantity: 0 },
      { name: "XXL", quantity: 0 },
    ];

    const structuredVariants = parsedVariants.map((variant) => {
      const sizes = defaultSizes.map((defaultSize) => {
        const providedSize = variant.sizes?.find(
          (s) => s.name === defaultSize.name
        );
        return {
          name: defaultSize.name,
          quantity: providedSize?.quantity || 0,
        };
      });

      return {
        color: variant.color,
        sizes,
      };
    });

    // Create product
    const product = await Product.create({
      name,
      description,
      category,
      price,
      oldPrice,
      variants: structuredVariants,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    // Delete uploaded images if product creation fails
    if (req.files) {
      req.files.forEach(async (file) => {
        try {
          await fs.unlink(path.join(__dirname, "../../uploads", file.filename));
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { category, isActive, search, page = 1, limit = 8 } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    // Add availability status to each variant
    const productsWithAvailability = products.map((product) => {
      const productObj = product.toObject();

      productObj.variants = productObj.variants.map((variant) => {
        const variantWithStatus = { ...variant };
        variantWithStatus.sizes = variant.sizes.map((size) => ({
          ...size,
          status: size.quantity === 0 ? "Sold Out" : "Available",
          available: size.quantity > 0,
        }));
        return variantWithStatus;
      });

      return productObj;
    });

    res.status(200).json({
      success: true,
      count: productsWithAvailability.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: productsWithAvailability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Add availability status
    const productObj = product.toObject();
    productObj.variants = productObj.variants.map((variant) => {
      const variantWithStatus = { ...variant };
      variantWithStatus.sizes = variant.sizes.map((size) => ({
        ...size,
        status: size.quantity === 0 ? "Sold Out" : "Available",
        available: size.quantity > 0,
      }));
      return variantWithStatus;
    });

    res.status(200).json({
      success: true,
      data: productObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      oldPrice,
      variants,
      imageUrls,
      removeImages,
      replaceImages,
      isActive,
    } = req.body;

    console.log("=== UPDATE PRODUCT CALLED ===");
    console.log("Update request body:", req.body);
    console.log("removeImages value:", removeImages);
    console.log("removeImages type:", typeof removeImages);
    console.log("removeImages exists:", removeImages !== undefined);

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Product found, current images:", product.images);

    // Handle image removal
    console.log("Checking removeImages condition...");
    console.log("removeImages:", removeImages);
    console.log("Is truthy?", !!removeImages);
    console.log("Has length?", removeImages?.length);

    if (removeImages && removeImages.length > 0) {
      console.log("ENTERING removeImages block!");
      const imagesToRemove =
        typeof removeImages === "string"
          ? JSON.parse(removeImages)
          : removeImages;

      console.log("=== IMAGE REMOVAL DEBUG ===");
      console.log("Images to remove:", JSON.stringify(imagesToRemove));
      console.log("Current product images:", JSON.stringify(product.images));
      console.log("Type of removeImages:", typeof removeImages);
      console.log("removeImages is array:", Array.isArray(imagesToRemove));

      // Delete physical files from uploads folder
      for (const imageUrl of imagesToRemove) {
        if (imageUrl && imageUrl.includes("/uploads/")) {
          const filename = imageUrl.split("/").pop();
          try {
            await fs.unlink(path.join(__dirname, "../../uploads", filename));
            console.log("✓ Deleted file:", filename);
          } catch (err) {
            console.error("✗ Error deleting file:", err.message);
          }
        }
      }

      // Remove images - normalize URLs by trimming whitespace
      const normalizedRemoveList = imagesToRemove.map((url) => url.trim());
      const normalizedProductImages = product.images.map((url) => url.trim());

      product.images = normalizedProductImages.filter(
        (img) => !normalizedRemoveList.includes(img)
      );

      console.log(
        "After filtering - product images:",
        JSON.stringify(product.images)
      );
      console.log("=== END DEBUG ===");
    }

    // Replace all images (if replaceImages is provided)
    if (replaceImages !== undefined) {
      const newImages =
        typeof replaceImages === "string"
          ? JSON.parse(replaceImages)
          : replaceImages;

      console.log("=== REPLACING ALL IMAGES ===");
      console.log("Old images:", product.images);
      console.log("New images:", newImages);

      product.images = newImages;
      console.log("Images replaced successfully");
    }
    // Add new images from URLs (only if provided and not replacing)
    else if (imageUrls && imageUrls.length > 0) {
      const newImageUrls =
        typeof imageUrls === "string" ? JSON.parse(imageUrls) : imageUrls;

      // Filter out duplicates - only add images that don't already exist
      const uniqueNewImages = newImageUrls.filter(
        (url) => !product.images.includes(url)
      );

      if (uniqueNewImages.length > 0) {
        product.images = [...product.images, ...uniqueNewImages];
      }
    }

    // Add new images from uploaded files (only if provided)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    // Update basic fields only if provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (oldPrice !== undefined) {
      // If oldPrice is null, empty string, or 0, remove it
      product.oldPrice =
        oldPrice === null || oldPrice === "" || oldPrice === 0
          ? null
          : oldPrice;
    }
    if (isActive !== undefined) product.isActive = isActive;

    // Update variants (colors and sizes)
    if (variants !== undefined) {
      const parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;

      console.log("Parsed variants:", parsedVariants);

      // Validate that we have at least one variant
      if (!parsedVariants || parsedVariants.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one color variant is required",
        });
      }

      // Ensure each variant has all sizes (M, L, XL, XXL)
      const defaultSizes = [
        { name: "M", quantity: 0 },
        { name: "L", quantity: 0 },
        { name: "XL", quantity: 0 },
        { name: "XXL", quantity: 0 },
      ];

      const structuredVariants = parsedVariants.map((variant) => {
        if (!variant.color) {
          throw new Error("Each variant must have a color");
        }

        const sizes = defaultSizes.map((defaultSize) => {
          const providedSize = variant.sizes?.find(
            (s) => s.name === defaultSize.name
          );
          return {
            name: defaultSize.name,
            quantity:
              providedSize?.quantity !== undefined ? providedSize.quantity : 0,
          };
        });

        return {
          color: variant.color,
          sizes,
        };
      });

      product.variants = structuredVariants;
      console.log("Structured variants:", structuredVariants);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete all product images
    for (const imageUrl of product.images) {
      const filename = imageUrl.split("/").pop();
      try {
        await fs.unlink(path.join(__dirname, "../../uploads", filename));
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product stock/quantity
// @route   PATCH /api/products/:id/stock
// @access  Admin
exports.updateProductStock = async (req, res) => {
  try {
    const { sizeName, quantity } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update only the specific size quantity
    if (sizeName && quantity !== undefined) {
      const sizeIndex = product.sizes.findIndex(
        (s) => s.name === sizeName.toUpperCase()
      );

      if (sizeIndex === -1) {
        return res.status(400).json({
          success: false,
          message: `Size ${sizeName} not found. Available sizes: M, L, XL, XXL`,
        });
      }

      product.sizes[sizeIndex].quantity = quantity;
      await product.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide sizeName and quantity",
      });
    }

    res.status(200).json({
      success: true,
      message: `Stock updated successfully for size ${sizeName}`,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
