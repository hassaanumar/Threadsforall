import asyncHandler from "express-async-handler";
import cloudinary from "../utils/cloudinary.js";

// @desc   Upload a product image (multipart file) to Cloudinary
// @route  POST /api/upload
// @access Private
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const b64 = Buffer.from(req.file.buffer).toString("base64");
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "threads-products",
    resource_type: "image",
    transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
  });

  res.json({ url: result.secure_url, publicId: result.public_id });
});

// @desc   Delete an uploaded image (e.g. user removes it before saving product)
// @route  DELETE /api/upload/:publicId
// @access Private
export const deleteImage = asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(req.params.publicId);
  res.json({ message: "Image deleted" });
});
