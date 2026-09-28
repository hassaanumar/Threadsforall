import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import productImportRoutes from "./routes/productImportRoutes.js";

// =========================================
// DATABASE
// =========================================

connectDB();

const app = express();

// =========================================
// CORS
// =========================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// =========================================
// NORMAL JSON BODY
// =========================================

app.use(express.json());

// =========================================
// HEALTH CHECK
// =========================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      status: "ok",
    });
  }
);

// =========================================
// ROUTES
// =========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/products/import",
  productImportRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

// =========================================
// ERROR HANDLING
// =========================================

app.use(notFound);

app.use(errorHandler);

// =========================================
// SERVER
// =========================================

const PORT =
  process.env.PORT || 5050;

app.listen(
  PORT,
  () => {
    console.log(
      `Threads API running on port ${PORT}`
    );
  }
);
