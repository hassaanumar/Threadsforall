import express from "express";
import multer from "multer";
import { uploadImage, deleteImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router = express.Router();

router.post("/", protect, upload.single("image"), uploadImage);
router.delete("/:publicId", protect, deleteImage);

export default router;
