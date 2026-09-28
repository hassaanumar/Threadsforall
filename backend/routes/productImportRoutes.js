import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import Product from "../models/Product.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    const allowedExtensions = [
      ".xlsx",
      ".xls",
    ];

    const extension = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));

    if (
      allowedTypes.includes(file.mimetype) ||
      allowedExtensions.includes(extension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only .xlsx and .xls Excel files are allowed."
        )
      );
    }
  },
});

const VALID_CATEGORIES = [
  "women-unstitched",
  "women-stitched",
  "girls",
  "boys",
];

const VALID_PIECE_TYPES = [
  "2-piece",
  "3-piece",
];

const clean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const numberValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : NaN;
};

const booleanValue = (
  value,
  defaultValue
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return [
    "true",
    "yes",
    "1",
  ].includes(
    String(value)
      .trim()
      .toLowerCase()
  );
};

const parseTags = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const parseImages = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({
      url,
      publicId: "",
    }));
};

/*
|--------------------------------------------------------------------------
| POST /api/products/import
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Please upload an Excel file.",
        });
      }

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
            "The Excel file does not contain a worksheet.",
        });
      }

      const worksheet =
        workbook.Sheets[sheetName];

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
            "The Excel file is empty.",
        });
      }

      const errors = [];

      /*
       * Products are grouped by barcode.
       *
       * Example:
       *
       * 10001 / M / Black
       * 10001 / L / Black
       *
       * becomes one product with
       * two variants.
       */

      const products = new Map();

      rows.forEach((row, index) => {
        const excelRow = index + 2;

        const barcode = clean(
          row.barcode
        );

        const name = clean(
          row.name
        );

        const description = clean(
          row.description
        );

        const category = clean(
          row.category
        ).toLowerCase();

        const price = numberValue(
          row.price
        );

        const compareAtPrice =
          row.compareAtPrice === ""
            ? undefined
            : numberValue(
                row.compareAtPrice
              );

        const color = clean(
          row.color
        );

        const size = clean(
          row.size
        );

        const stock = numberValue(
          row.stock
        );

        const pieceTypeValue =
          clean(
            row.pieceType
          ).toLowerCase();

        const tags = parseTags(
          row.tags
        );

        const images = parseImages(
          row.image
        );

        const isFeatured =
          booleanValue(
            row.isFeatured,
            false
          );

        const isActive =
          booleanValue(
            row.isActive,
            true
          );

        /*
         * BASIC VALIDATION
         */

        if (!barcode) {
          errors.push({
            row: excelRow,
            message:
              "Barcode is required.",
          });

          return;
        }

        if (!name) {
          errors.push({
            row: excelRow,
            message:
              "Product name is required.",
          });

          return;
        }

        if (
          !VALID_CATEGORIES.includes(
            category
          )
        ) {
          errors.push({
            row: excelRow,
            message:
              `Invalid category "${category}".`,
          });

          return;
        }

        if (
          !Number.isFinite(price) ||
          price < 0
        ) {
          errors.push({
            row: excelRow,
            message:
              "Price must be a valid positive number.",
          });

          return;
        }

        if (
          compareAtPrice !==
            undefined &&
          (!Number.isFinite(
            compareAtPrice
          ) ||
            compareAtPrice < 0)
        ) {
          errors.push({
            row: excelRow,
            message:
              "compareAtPrice must be a valid number.",
          });

          return;
        }

        if (
          !Number.isFinite(stock) ||
          stock < 0
        ) {
          errors.push({
            row: excelRow,
            message:
              "Stock must be a valid positive number.",
          });

          return;
        }

        /*
         * UNSTITCHED RULES
         */

        let pieceType = null;

        if (
          category ===
          "women-unstitched"
        ) {
          if (
            !VALID_PIECE_TYPES.includes(
              pieceTypeValue
            )
          ) {
            errors.push({
              row: excelRow,
              message:
                'Unstitched products must have pieceType "2-piece" or "3-piece".',
            });

            return;
          }

          if (size) {
            errors.push({
              row: excelRow,
              message:
                "Unstitched products cannot have a size.",
            });

            return;
          }

          pieceType =
            pieceTypeValue;
        }

        /*
         * STITCHED RULES
         */

        if (
          category ===
            "women-stitched" &&
          !size
        ) {
          errors.push({
            row: excelRow,
            message:
              "Women stitched products require a size.",
          });

          return;
        }

        /*
         * GIRLS / BOYS
         *
         * Size is allowed but not
         * strictly required.
         */

        /*
         * CREATE VARIANT
         */

        const variant = {
          size,
          color,
          stock,
        };

        /*
         * FIRST ROW FOR PRODUCT
         */

        if (!products.has(barcode)) {
          products.set(barcode, {
            barcode,
            name,
            description,
            category,
            pieceType,
            price,
            compareAtPrice,
            images,
            variants: [],
            isFeatured,
            isActive,
            tags,
          });
        }

        const product =
          products.get(barcode);

        /*
         * CHECK SAME PRODUCT
         */

        if (
          product.name !== name ||
          product.category !==
            category ||
          product.price !== price
        ) {
          errors.push({
            row: excelRow,
            message:
              `Barcode ${barcode} contains conflicting product information.`,
          });

          return;
        }

        /*
         * PIECE TYPE MUST MATCH
         */

        if (
          category ===
          "women-unstitched"
        ) {
          if (
            product.pieceType !==
            pieceType
          ) {
            errors.push({
              row: excelRow,
              message:
                `Barcode ${barcode} has conflicting pieceType values.`,
            });

            return;
          }
        }

        /*
         * PREVENT DUPLICATE VARIANTS
         */

        const duplicateVariant =
          product.variants.some(
            (existing) =>
              existing.size ===
                variant.size &&
              existing.color ===
                variant.color
          );

        if (duplicateVariant) {
          errors.push({
            row: excelRow,
            message:
              `Duplicate variant for barcode ${barcode}: ${variant.size || "no size"} / ${variant.color || "no color"}.`,
          });

          return;
        }

        product.variants.push(
          variant
        );

        /*
         * Add any new image
         */

        for (const image of images) {
          const exists =
            product.images.some(
              (existing) =>
                existing.url ===
                image.url
            );

          if (!exists) {
            product.images.push(
              image
            );
          }
        }

        /*
         * Add any new tags
         */

        for (const tag of tags) {
          if (
            !product.tags.includes(tag)
          ) {
            product.tags.push(tag);
          }
        }
      });

      /*
       * STOP EVERYTHING IF EXCEL
       * CONTAINS INVALID DATA
       */

      if (errors.length) {
        return res.status(400).json({
          message:
            "Import stopped. Please fix the Excel errors.",
          errors,
        });
      }

      const imported = [];
      const skipped = [];

      /*
       * INSERT PRODUCTS
       */

      for (const product of products.values()) {
        const existing =
          await Product.findOne({
            barcode:
              product.barcode,
          });

        if (existing) {
          skipped.push({
            barcode:
              product.barcode,
            name: product.name,
            reason:
              "Barcode already exists.",
          });

          continue;
        }

        const created =
          await Product.create(
            product
          );

        imported.push({
          id: created._id,
          barcode:
            created.barcode,
          name: created.name,
        });
      }

      return res.json({
        message:
          "Products imported successfully.",

        importedCount:
          imported.length,

        skippedCount:
          skipped.length,

        imported,

        skipped,
      });
    } catch (error) {
      console.error(
        "PRODUCT EXCEL IMPORT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to import products.",
      });
    }
  }
);

export default router;
