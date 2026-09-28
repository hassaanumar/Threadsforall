// Bulk-import products from your stock sheet (.xlsx or .csv) into MongoDB.
//
// Usage:
//   npm run import:products -- /path/to/stock-sheet.xlsx
//   npm run import:products -- /path/to/stock-sheet.xlsx --dry-run
//
// --dry-run prints what WOULD be imported without touching the database -
// always run this first and check the output before importing for real.
//
// ── HOW TO POINT THIS AT YOUR ACTUAL SHEET ──────────────────────────────
// I built this against the column names described to me (barcode, name,
// category, price, stock) as a starting guess. Your real sheet almost
// certainly uses different header text/order. Open your sheet, look at
// the exact column headers in row 1, and edit the COLUMN_MAP below so the
// keys on the right match your headers exactly (case-insensitive, spaces
// are fine). Send me the sheet (or just its headers) and I'll edit this
// for you directly instead.

import path from "path";
import dotenv from "dotenv";
import xlsx from "xlsx";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

// ── EDIT THIS to match your sheet's actual column headers ───────────────
const COLUMN_MAP = {
  barcode: "Barcode",
  name: "Product Name",
  category: "Category", // expected to contain something like "Ladies Unstitched" / "Girls"
  price: "Price",
  stock: "Stock",
  size: "Size", // optional column - leave blank in sheet if not used
  color: "Color", // optional column - leave blank in sheet if not used
  description: "Description", // optional
};

// ── EDIT THIS if your category text differs ──────────────────────────────
// Maps text found in the sheet's category column to this app's category
// enum: women-unstitched | women-stitched | girls | boys | accessories
const CATEGORY_RULES = [
  { match: /ladies?.*unstitched|unstitched.*ladies?|women.*unstitched/i, value: "women-unstitched" },
  { match: /ladies?.*stitched|women.*stitched/i, value: "women-stitched" },
  { match: /girl/i, value: "girls" },
  { match: /boy/i, value: "boys" },
  { match: /access/i, value: "accessories" },
];

const inferCategory = (raw) => {
  if (!raw) return "women-unstitched"; // fallback default - adjust if that's wrong
  const rule = CATEGORY_RULES.find((r) => r.match.test(String(raw)));
  return rule ? rule.value : "women-unstitched";
};

const readRows = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
};

const getCol = (row, key) => {
  const wantedHeader = COLUMN_MAP[key];
  if (!wantedHeader) return undefined;
  // case-insensitive, trimmed header match against actual sheet headers
  const actualKey = Object.keys(row).find(
    (k) => k.trim().toLowerCase() === wantedHeader.trim().toLowerCase()
  );
  return actualKey ? row[actualKey] : undefined;
};

const buildProductDoc = (row) => {
  const barcode = String(getCol(row, "barcode") ?? "").trim();
  const name = String(getCol(row, "name") ?? "").trim();
  const priceRaw = getCol(row, "price");
  const stockRaw = getCol(row, "stock");
  const size = String(getCol(row, "size") ?? "").trim();
  const color = String(getCol(row, "color") ?? "").trim();

  if (!barcode || !name) return { error: "Missing barcode or name", row };

  const price = Number(priceRaw);
  const stock = Number(stockRaw) || 0;

  if (Number.isNaN(price)) return { error: `Invalid price "${priceRaw}"`, row };

  const doc = {
    barcode,
    name,
    description: String(getCol(row, "description") ?? ""),
    category: inferCategory(getCol(row, "category")),
    price,
    totalStock: stock,
    isActive: true,
  };

  // If a size or color is present, store it as a single variant carrying
  // the stock count, rather than a flat totalStock. You can merge rows
  // that share a barcode with different sizes into one product later if
  // your sheet has one row per barcode+size combination - ask me and I'll
  // adjust this to group rows instead of overwriting.
  if (size || color) {
    doc.variants = [{ size: size || undefined, color: color || undefined, stock }];
  }

  return { doc };
};

const run = async () => {
  const filePath = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");

  if (!filePath) {
    console.error("Usage: npm run import:products -- /path/to/sheet.xlsx [--dry-run]");
    process.exit(1);
  }

  const rows = readRows(path.resolve(filePath));
  console.log(`Read ${rows.length} rows from ${filePath}`);

  const results = rows.map(buildProductDoc);
  const errors = results.filter((r) => r.error);
  const valid = results.filter((r) => r.doc);

  if (errors.length) {
    console.log(`\n${errors.length} row(s) skipped due to problems:`);
    errors.slice(0, 10).forEach((e) => console.log(`  - ${e.error}`));
    if (errors.length > 10) console.log(`  ...and ${errors.length - 10} more`);
  }

  console.log(`\n${valid.length} product(s) ready to import.`);
  console.log("Sample of the first 3 mapped products:");
  console.log(JSON.stringify(valid.slice(0, 3).map((v) => v.doc), null, 2));

  if (dryRun) {
    console.log("\nDry run only - nothing was written to the database.");
    return;
  }

  await connectDB();

  let created = 0;
  let updated = 0;

  for (const { doc } of valid) {
    const existing = await Product.findOne({ barcode: doc.barcode });
    if (existing) {
      Object.assign(existing, doc);
      await existing.save();
      updated += 1;
    } else {
      await Product.create(doc);
      created += 1;
    }
  }

  console.log(`\nDone. Created ${created}, updated ${updated}.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
