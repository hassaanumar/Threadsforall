import "dotenv/config";

import asyncHandler from "express-async-handler";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

// =========================================
// CONSTANTS
// =========================================

const FLAT_SHIPPING_FEE = 200;

// =========================================
// ORDER NUMBER
// =========================================

const generateOrderNumber = () => {
  const timestamp =
    Date.now()
      .toString()
      .slice(-8);

  const random =
    Math.floor(
      100 + Math.random() * 900
    );

  return `TH-${timestamp}${random}`;
};

// =========================================
// VALIDATE CART
// =========================================

const buildValidatedItems = async (
  cartItems
) => {
  const items = [];

  let subtotal = 0;

  for (const line of cartItems) {
    const product =
      await Product.findById(
        line.productId
      );

    if (
      !product ||
      !product.isActive
    ) {
      throw new Error(
        "A product in your cart is no longer available."
      );
    }

    let availableStock =
      product.totalStock;

    // =====================================
    // VARIANT STOCK
    // =====================================

    if (
      line.size ||
      line.color
    ) {
      const variant =
        product.variants.find(
          (v) =>
            (v.size || null) ===
              (line.size || null) &&
            (v.color || null) ===
              (line.color || null)
        );

      if (!variant) {
        throw new Error(
          `${product.name} is not available in that size/color anymore.`
        );
      }

      availableStock =
        variant.stock;
    }

    // =====================================
    // CHECK STOCK
    // =====================================

    if (
      availableStock <
      line.quantity
    ) {
      throw new Error(
        `Only ${availableStock} left in stock for ${product.name}.`
      );
    }

    // =====================================
    // CALCULATE PRICE
    // =====================================

    const lineTotal =
      product.price *
      line.quantity;

    subtotal += lineTotal;

    // =====================================
    // SAVE VERIFIED ITEM
    // =====================================

    items.push({
      product:
        product._id,

      name:
        product.name,

      image:
        product.images?.[0]?.url,

      size:
        line.size,

      color:
        line.color,

      price:
        product.price,

      quantity:
        line.quantity,
    });
  }

  return {
    items,
    subtotal,
  };
};

// =========================================
// DECREMENT STOCK
// =========================================

const decrementStock = async (
  items
) => {
  for (const item of items) {
    const product =
      await Product.findById(
        item.product
      );

    if (!product) {
      continue;
    }

    // =====================================
    // VARIANT STOCK
    // =====================================

    if (
      item.size ||
      item.color
    ) {
      const variant =
        product.variants.find(
          (v) =>
            (v.size || null) ===
              (item.size || null) &&
            (v.color || null) ===
              (item.color || null)
        );

      if (variant) {
        variant.stock =
          Math.max(
            0,
            variant.stock -
              item.quantity
          );
      }
    }

    // =====================================
    // NORMAL PRODUCT STOCK
    // =====================================

    else {
      product.totalStock =
        Math.max(
          0,
          product.totalStock -
            item.quantity
        );
    }

    await product.save();
  }
};

// =========================================
// COD ORDER
// =========================================
//
// POST /api/orders/cod
// Public
//

export const createCodOrder =
  asyncHandler(
    async (req, res) => {
      const {
        items: cartItems,
        customer,
      } = req.body;

      // =====================================
      // CART CHECK
      // =====================================

      if (!cartItems?.length) {
        res.status(400);

        throw new Error(
          "Your cart is empty."
        );
      }

      // =====================================
      // CUSTOMER VALIDATION
      // =====================================

      if (!customer?.name) {
        res.status(400);

        throw new Error(
          "Customer name is required."
        );
      }

      if (!customer?.phone) {
        res.status(400);

        throw new Error(
          "Phone number is required."
        );
      }

      if (!customer?.address) {
        res.status(400);

        throw new Error(
          "Delivery address is required."
        );
      }

      if (!customer?.city) {
        res.status(400);

        throw new Error(
          "City is required."
        );
      }

      // =====================================
      // VALIDATE CART
      // =====================================

      const {
        items,
        subtotal,
      } =
        await buildValidatedItems(
          cartItems
        );

      // =====================================
// SHIPPING
// =====================================
//
// Free shipping on orders of Rs 5,000 or more.
// Otherwise shipping is Rs 200.
//

const shippingFee =
  subtotal >= 5000
    ? 0
    : FLAT_SHIPPING_FEE;

// =====================================
// TOTAL
// =====================================

const total =
  subtotal +
  shippingFee;


      // =====================================
      // CREATE ORDER
      // =====================================

      const order =
        await Order.create({
          orderNumber:
            generateOrderNumber(),

          items,

          customer,

          subtotal,

          shippingFee:
  shippingFee,

          total,

          paymentMethod:
            "cod",

          paymentStatus:
            "pending",

          status:
            "placed",
        });

      // =====================================
      // DECREMENT STOCK
      // =====================================

      await decrementStock(
        items
      );

      // =====================================
      // RESPONSE
      // =====================================

      return res
        .status(201)
        .json({
          order,
        });
    }
  );

// =========================================
// GET ORDER BY NUMBER
// =========================================
//
// GET /api/orders/track/:orderNumber
// Public
//

export const getOrderByNumber =
  asyncHandler(
    async (req, res) => {
      const order =
        await Order.findOne({
          orderNumber:
            req.params.orderNumber,
        });

      if (!order) {
        res.status(404);

        throw new Error(
          "Order not found."
        );
      }

      return res.json(
        order
      );
    }
  );

// =========================================
// ADMIN: GET ORDERS
// =========================================
//
// GET /api/orders
// Private
//

export const getOrders =
  asyncHandler(
    async (req, res) => {
      const {
        status,
      } = req.query;

      const query =
        status
          ? { status }
          : {};

      const orders =
        await Order.find(
          query
        ).sort({
          createdAt:
            -1,
        });

      return res.json(
        orders
      );
      
    }
  );

// =========================================
// ADMIN: UPDATE ORDER STATUS
// =========================================
//
// PUT /api/orders/:id/status
// Private
//

export const updateOrderStatus =
  asyncHandler(
    async (req, res) => {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        res.status(404);

        throw new Error(
          "Order not found."
        );
      }

      // ===================================
      // UPDATE ORDER STATUS
      // ===================================

      if (
        req.body.status
      ) {
        order.status =
          req.body.status;
      }

      // ===================================
      // UPDATE PAYMENT STATUS
      // ===================================

      if (
        req.body.paymentStatus
      ) {
        order.paymentStatus =
          req.body.paymentStatus;
      }

      // ===================================
      // SAVE
      // ===================================

      const updated =
        await order.save();

      return res.json(
        updated
      );
    }
  );
