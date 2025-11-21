// Validate Product Creation/Update
exports.validateProduct = (req, res, next) => {
  const { name, description, category, price, variants } = req.body;
  const errors = [];

  // Validate name
  if (!name || name.trim().length < 3) {
    errors.push("Product name must be at least 3 characters");
  }

  // Validate description
  if (!description || description.trim().length < 10) {
    errors.push("Description must be at least 10 characters");
  }

  // Validate category
  const validCategories = [
    "T-Shirt",
    "Sweatshirt",
    "Hoodie",
    "Pants",
    "Jeans",
    "Shorts",
    "Jacket",
    "Other",
  ];
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(", ")}`);
  }

  // Validate price
  if (!price || isNaN(price) || price < 0) {
    errors.push("Price must be a positive number");
  }

  // Validate variants (color + sizes)
  let parsedVariants;
  try {
    console.log("Raw variants:", variants);
    console.log("Variants type:", typeof variants);

    parsedVariants =
      typeof variants === "string" ? JSON.parse(variants) : variants;

    console.log("Parsed variants:", parsedVariants);

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      errors.push("At least one color variant is required");
    } else {
      // Validate each variant
      parsedVariants.forEach((variant, index) => {
        if (!variant.color || variant.color.trim().length === 0) {
          errors.push(`Variant ${index + 1}: Color is required`);
        }

        if (!variant.sizes || !Array.isArray(variant.sizes)) {
          errors.push(`Variant ${index + 1}: Sizes array is required`);
        } else {
          const validSizeNames = ["M", "L", "XL", "XXL"];
          variant.sizes.forEach((size, sizeIndex) => {
            if (
              !size.name ||
              !validSizeNames.includes(size.name.toUpperCase())
            ) {
              errors.push(
                `Variant ${index + 1}, Size ${
                  sizeIndex + 1
                }: Invalid size name. Valid sizes: M, L, XL, XXL`
              );
            }
            if (
              size.quantity === undefined ||
              isNaN(size.quantity) ||
              size.quantity < 0
            ) {
              errors.push(
                `Variant ${index + 1}, Size ${
                  sizeIndex + 1
                }: Quantity must be a non-negative number`
              );
            }
          });
        }
      });
    }
  } catch (error) {
    console.log("Variants parsing error:", error.message);
    errors.push(
      `Variants must be a valid JSON array with color and sizes. Error: ${error.message}`
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

// Validate MongoDB ObjectId
exports.validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID format",
    });
  }

  next();
};

// Validate Stock Update
exports.validateStockUpdate = (req, res, next) => {
  const { sizeName, quantity } = req.body;
  const errors = [];

  if (!sizeName) {
    errors.push("Size name is required");
  } else {
    const validSizes = ["M", "L", "XL", "XXL"];
    if (!validSizes.includes(sizeName.toUpperCase())) {
      errors.push(`Invalid size. Valid sizes are: M, L, XL, XXL`);
    }
  }

  if (quantity === undefined || quantity === null) {
    errors.push("Quantity is required");
  } else if (isNaN(quantity) || quantity < 0) {
    errors.push("Quantity must be a non-negative number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};
