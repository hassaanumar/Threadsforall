import express from "express";
import multer from "multer";
import XLSX from "xlsx";

import {
  getProducts,
  getProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import Product from "../models/Product.js";

import {
  protect,
  requireOwner,
} from "../middleware/auth.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Excel upload
|--------------------------------------------------------------------------
*/

const upload = multer({
  storage: multer.memoryStorage(),
});

/*
|--------------------------------------------------------------------------
| Product routes
|--------------------------------------------------------------------------
*/

router.get("/", getProducts);

router.get(
  "/admin",
  protect,
  getProductsAdmin
);

/*
|--------------------------------------------------------------------------
| IMPORT PRODUCTS FROM EXCEL
|--------------------------------------------------------------------------
|
| POST /api/products/import
|
*/

router.post(
  "/import",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      /*
       * Check file
       */
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload an Excel file.",
        });
      }

      /*
       * Read Excel workbook
       */
      const workbook = XLSX.read(
        req.file.buffer,
        {
          type: "buffer",
        }
      );

      const sheetName =
        workbook.SheetNames[0];

      if (!sheetName) {
        return res.status(400).json({
          message:
            "Excel file does not contain a worksheet.",
        });
      }

      const worksheet =
        workbook.Sheets[sheetName];

      /*
       * Convert rows into JavaScript objects
       */
      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
          }
        );

      if (!rows.length) {
        return res.status(400).json({
          message:
            "Excel file is empty.",
        });
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;

      /*
       * Process every Excel row
       */
      for (const row of rows) {
        const barcode = String(
          row.barcode || ""
        ).trim();

        const name = String(
          row.name || ""
        ).trim();

        const category = String(
          row.category || ""
        ).trim();

        /*
         * Required fields
         */
        if (
          !barcode ||
          !name ||
          !category
        ) {
          skipped++;
          continue;
        }

        /*
         * Allowed categories
         */
        const allowedCategories = [
          "women-unstitched",
          "women-stitched",
          "girls",
          "boys",
        ];

        if (
          !allowedCategories.includes(
            category
          )
        ) {
          skipped++;
          continue;
        }

        /*
         * Basic product information
         */
        const price = Number(
          row.price || 0
        );

        const compareAtPrice =
          row.compareAtPrice !== ""
            ? Number(
                row.compareAtPrice
              )
            : undefined;

        const description =
          String(
            row.description || ""
          ).trim();

        /*
         * Featured
         */
        const isFeatured =
          String(
            row.isFeatured || ""
          ).toLowerCase() === "true";

        /*
         * Active
         */
        const isActive =
          row.isActive === ""
            ? true
            : String(
                row.isActive
              ).toLowerCase() !==
              "false";

        /*
         * Variants
         */
        let variants = [];

        const color = String(
          row.color || ""
        ).trim();

        const stock = Number(
          row.stock || 0
        );

        /*
         * WOMEN UNSTITCHED
         *
         * No normal clothing size.
         *
         * pieceType should be:
         *
         * 2 piece
         * 3 piece
         */
        if (
          category ===
          "women-unstitched"
        ) {
          const pieceType =
            String(
              row.pieceType || ""
            ).trim();

          if (
            pieceType !==
              "2 piece" &&
            pieceType !==
              "3 piece"
          ) {
            skipped++;
            continue;
          }

          variants = [
            {
              size: pieceType,
              color,
              stock,
            },
          ];
        } else {
          /*
           * STITCHED / GIRLS / BOYS
           *
           * These can use normal sizes.
           */
          const size = String(
            row.size || ""
          ).trim();

          variants = [
            {
              size,
              color,
              stock,
            },
          ];
        }

        /*
         * Calculate total stock
         */
        const totalStock =
          variants.reduce(
            (sum, variant) =>
              sum +
              Number(
                variant.stock || 0
              ),
            0
          );

        /*
         * Product object
         */
        const productData = {
          barcode,
          name,
          description,
          category,
          price,
          variants,
          totalStock,
          isFeatured,
          isActive,
        };

        /*
         * Only add compareAtPrice
         * when it has a value.
         */
        if (
          row.compareAtPrice !==
            "" &&
          row.compareAtPrice !==
            undefined
        ) {
          productData.compareAtPrice =
            compareAtPrice;
        }

        /*
         * Find product by barcode
         *
         * Existing barcode = update
         * New barcode = create
         */
        const existing =
          await Product.findOne({
            barcode,
          });

        if (existing) {
          Object.assign(
            existing,
            productData
          );

          await existing.save();

          updated++;
        } else {
          await Product.create(
            productData
          );

          created++;
        }
      }

      /*
       * Return result
       */
      return res.status(200).json({
        message: `Import complete. ${created} created, ${updated} updated, ${skipped} skipped.`,
        created,
        updated,
        skipped,
        total:
          created +
          updated,
      });
    } catch (error) {
      console.error(
        "Excel product import error:",
        error
      );

      /*
       * Duplicate barcode / validation
       * errors will come here too.
       */
      return res.status(500).json({
        message:
          error.message ||
          "Failed to import products.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Individual product routes
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getProductById
);

router.post(
  "/",
  protect,
  createProduct
);

router.put(
  "/:id",
  protect,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  requireOwner,
  deleteProduct
);

export default router;
