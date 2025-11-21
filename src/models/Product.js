const mongoose = require("mongoose");

// Color-Size Variant Schema - كل لون مع مقاساته
const colorVariantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    sizes: [
      {
        name: {
          type: String,
          required: true,
          enum: ["M", "L", "XL", "XXL"],
          uppercase: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0, "Quantity cannot be negative"],
          default: 0,
        },
      },
    ],
  },
  { _id: false }
);

// Default sizes - المقاسات الثابتة
const DEFAULT_SIZES = [
  { name: "M", quantity: 0 },
  { name: "L", quantity: 0 },
  { name: "XL", quantity: 0 },
  { name: "XXL", quantity: 0 },
];

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: [
          "T-Shirt",
          "Sweatshirt",
          "Hoodie",
          "Pants",
          "Jeans",
          "Shorts",
          "Jacket",
          "Suit",
          "Other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // كل لون مع الكميات بتاعته لكل مقاس
    variants: {
      type: [colorVariantSchema],
      required: [true, "At least one color variant is required"],
      validate: {
        validator: function (variants) {
          return variants && variants.length > 0;
        },
        message: "Product must have at least one color variant",
      },
    },

    images: [
      {
        type: String,
        required: true,
      },
    ],

    totalStock: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Initialize default sizes for each variant
productSchema.pre("validate", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant) => {
      if (!variant.sizes || variant.sizes.length === 0) {
        variant.sizes = DEFAULT_SIZES;
      } else {
        // Ensure all default sizes exist
        const existingSizes = variant.sizes.map((s) => s.name);
        DEFAULT_SIZES.forEach((defaultSize) => {
          if (!existingSizes.includes(defaultSize.name)) {
            variant.sizes.push(defaultSize);
          }
        });
        // Sort sizes in the correct order
        variant.sizes.sort((a, b) => {
          const order = ["M", "L", "XL", "XXL"];
          return order.indexOf(a.name) - order.indexOf(b.name);
        });
      }
    });
  }
  next();
});

// Calculate total stock from all variants
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((total, variant) => {
      const variantTotal = variant.sizes.reduce(
        (sum, size) => sum + size.quantity,
        0
      );
      return total + variantTotal;
    }, 0);
  }
  next();
});

// Index للبحث السريع
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
module.exports.DEFAULT_SIZES = DEFAULT_SIZES;
