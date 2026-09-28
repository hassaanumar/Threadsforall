import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";

// @desc   List products (public storefront) with filtering, search, pagination
// @route  GET /api/products
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, featured, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;
  if (featured === "true") query.isFeatured = true;
  if (search) query.$text = { $search: search };

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.min(parseInt(limit), 50);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc   Get every product for the admin panel, including inactive ones
// @route  GET /api/products/admin
// @access Private
export const getProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
});

// @desc   Get a single product by id
// @route  GET /api/products/:id
// @access Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// @desc   Create a product
// @route  POST /api/products
// @access Private
export const createProduct = asyncHandler(async (req, res) => {
  const product = new Product(req.body);
  const created = await product.save();
  res.status(201).json(created);
});

// @desc   Update a product
// @route  PUT /api/products/:id
// @access Private
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  Object.assign(product, req.body);
  const updated = await product.save();
  res.json(updated);
});

// @desc   Delete a product (and its Cloudinary images)
// @route  DELETE /api/products/:id
// @access Private (owner only)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await Promise.all(
    (product.images || [])
      .filter((img) => img.publicId)
      .map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}))
  );

  await product.deleteOne();
  res.json({ message: "Product removed" });
});
