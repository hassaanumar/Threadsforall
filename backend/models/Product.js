import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    // For unstitched products this can be:
    // "2 Piece" or "3 Piece"
    // For stitched/girls/boys it can be:
    // "S", "M", "L", "XL", etc.
    size: {
      type: String,
      trim: true,
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "",
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: true,
      enum: [
        "women-unstitched",
        "women-stitched",
        "girls",
        "boys",
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    images: [
      {
        url: String,
        publicId: String,
      },
    ],

    variants: [variantSchema],

    totalStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

// Keep totalStock synchronized with variants.
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce(
      (sum, variant) => sum + (variant.stock || 0),
      0
    );
  }

  next();
});

export default mongoose.model("Product", productSchema);
