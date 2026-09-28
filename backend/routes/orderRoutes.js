import express from "express";

import {
  createCodOrder,
  getOrderByNumber,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

import {
  protect,
} from "../middleware/auth.js";

const router =
  express.Router();

// =========================================
// COD ORDER
// =========================================

router.post(
  "/cod",
  createCodOrder
);

// =========================================
// TRACK ORDER
// =========================================

router.get(
  "/track/:orderNumber",
  getOrderByNumber
);

// =========================================
// ADMIN GET ORDERS
// =========================================

router.get(
  "/",
  protect,
  getOrders
);

// =========================================
// ADMIN UPDATE ORDER
// =========================================

router.put(
  "/:id/status",
  protect,
  updateOrderStatus
);

export default router;

