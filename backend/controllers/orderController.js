import "dotenv/config";

import asyncHandler from "express-async-handler";
import { Safepay } from "@sfpy/node-sdk";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

// =========================================
// SAFEPAY
// =========================================

console.log("=== SAFEPAY CHECK ===");
console.log("ENV:", process.env.SAFEPAY_ENV);
console.log(
  "API KEY:",
  !!process.env.SAFEPAY_API_KEY
);
console.log(
  "V1 SECRET:",
  !!process.env.SAFEPAY_API_SECRET_KEY
);
console.log(
  "WEBHOOK:",
  !!process.env.SAFEPAY_WEBHOOK_SECRET
);
console.log("=====================");

const safepay = new Safepay({
  environment:
    process.env.SAFEPAY_ENV || "sandbox",

  apiKey:
    process.env.SAFEPAY_API_KEY,

  v1Secret:
    process.env.SAFEPAY_API_SECRET_KEY,

  webhookSecret:
    process.env.SAFEPAY_WEBHOOK_SECRET,
});

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
      // TOTAL
      // =====================================

      const total =
        subtotal +
        FLAT_SHIPPING_FEE;

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
            FLAT_SHIPPING_FEE,

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
// SAFEPAY CARD PAYMENT
// =========================================
//
// POST /api/orders/create-payment
// Public
//

export const createSafepayPayment =
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
      // VALIDATE PRODUCTS
      // =====================================

      const {
        items,
        subtotal,
      } =
        await buildValidatedItems(
          cartItems
        );

      // =====================================
      // CALCULATE TOTAL
      // =====================================

      const total =
        subtotal +
        FLAT_SHIPPING_FEE;

      // =====================================
      // CREATE INTERNAL ORDER
      // =====================================

      const order =
        await Order.create({
          orderNumber:
            generateOrderNumber(),

          items,

          customer,

          subtotal,

          shippingFee:
            FLAT_SHIPPING_FEE,

          total,

          paymentMethod:
            "card",

          paymentStatus:
            "pending",

          status:
            "placed",
        });

      try {
        // ===================================
        // CREATE SAFEPAY PAYMENT
        // ===================================

        console.log(
          "================================="
        );

        console.log(
          "Creating Safepay payment..."
        );

        console.log(
          "Order:",
          order.orderNumber
        );

        console.log(
          "Amount:",
          total
        );

        const payment =
          await safepay.payments.create({
            amount:
              total,

            currency:
              "PKR",
          });

        console.log(
          "Safepay payment response:",
          payment
        );

        // ===================================
        // GET TRACKER
        // ===================================

        const token =
          payment?.token;

        if (!token) {
          throw new Error(
            "Safepay did not return a payment token."
          );
        }

        console.log(
          "Safepay tracker:",
          token
        );

        // ===================================
        // CREATE CHECKOUT
        // ===================================

        const checkoutUrl =
          safepay.checkout.create({
            token,

            orderId:
              order.orderNumber,

            cancelUrl:
              `${process.env.CLIENT_URL}/checkout`,

            redirectUrl:
              `${process.env.CLIENT_URL}/order-success?order=${order.orderNumber}`,

            source:
              "custom",

            webhooks:
              true,
          });

        if (!checkoutUrl) {
          throw new Error(
            "Safepay did not return a checkout URL."
          );
        }

        console.log(
          "Safepay checkout created successfully."
        );

        // ===================================
        // SAVE TRACKER
        // ===================================

        order.safepayTracker =
          token;

        await order.save();

        console.log(
          "Order saved with Safepay tracker."
        );

        console.log(
          "Order number:",
          order.orderNumber
        );

        console.log(
          "================================="
        );

        // ===================================
        // SEND CHECKOUT URL
        // ===================================

        return res
          .status(200)
          .json({
            url:
              checkoutUrl,

            orderNumber:
              order.orderNumber,
          });
      } catch (error) {
        // ===================================
        // REMOVE FAILED ORDER
        // ===================================

        await Order.findByIdAndDelete(
          order._id
        );

        console.error(
          "Safepay payment creation failed:"
        );

        console.error(
          error
        );

        throw error;
      }
    }
  );

// =========================================
// SAFEPAY WEBHOOK
// =========================================
//
// POST /api/orders/safepay-webhook
// Public
//
// IMPORTANT:
// server.js MUST register this route
// BEFORE express.json()
//

export const safepayWebhook =
  asyncHandler(
    async (req, res) => {
      try {
        console.log(
          "================================="
        );

        console.log(
          "SAFEPAY WEBHOOK HIT"
        );

        console.log(
          "================================="
        );

        // ===================================
        // VERIFY WEBHOOK
        // ===================================

        const valid =
          await safepay.verify.webhook(
            req
          );

        console.log(
          "Webhook signature valid:",
          valid
        );

        if (!valid) {
          console.error(
            "Invalid Safepay webhook signature."
          );

          return res
            .status(400)
            .json({
              message:
                "Invalid Safepay webhook signature.",
            });
        }

        // ===================================
        // READ RAW BODY
        // ===================================

        let payload =
          req.body;

        if (
          Buffer.isBuffer(
            payload
          )
        ) {
          payload =
            payload.toString(
              "utf8"
            );
        }

        if (
          typeof payload ===
          "string"
        ) {
          payload =
            JSON.parse(
              payload
            );
        }

        // ===================================
        // LOG COMPLETE PAYLOAD
        // ===================================

        console.log(
          "================================="
        );

        console.log(
          "SAFEPAY WEBHOOK PAYLOAD"
        );

        console.log(
          JSON.stringify(
            payload,
            null,
            2
          )
        );

        console.log(
          "================================="
        );

        // ===================================
        // FIND ALL POSSIBLE ORDER IDs
        // ===================================

        const orderNumber =
          payload?.data?.order_id ||
          payload?.data?.orderId ||
          payload?.data?.orderID ||
          payload?.order_id ||
          payload?.orderId ||
          payload?.orderID ||
          payload?.data?.order?.id ||
          payload?.data?.order?.order_id ||
          payload?.data?.order?.orderId;

        // ===================================
        // FIND SAFEPAY TRACKER
        // ===================================

        const tracker =
          payload?.data?.tracker ||
          payload?.data?.token ||
          payload?.tracker ||
          payload?.token ||
          payload?.data?.payment?.tracker ||
          payload?.data?.payment?.token;

        console.log(
          "Webhook order number:",
          orderNumber
        );

        console.log(
          "Webhook tracker:",
          tracker
        );

        // ===================================
        // FIND ORDER
        // ===================================

        let order = null;

        // First try order number.
        if (orderNumber) {
          order =
            await Order.findOne({
              orderNumber:
                String(
                  orderNumber
                ),
            });
        }

        // If order number wasn't supplied,
        // try the Safepay tracker.
        if (
          !order &&
          tracker
        ) {
          order =
            await Order.findOne({
              safepayTracker:
                String(
                  tracker
                ),
            });
        }

        // ===================================
        // ORDER NOT FOUND
        // ===================================

        if (!order) {
          console.warn(
            "================================="
          );

          console.warn(
            "ORDER NOT FOUND FROM WEBHOOK"
          );

          console.warn(
            "Order number:",
            orderNumber
          );

          console.warn(
            "Tracker:",
            tracker
          );

          console.warn(
            "================================="
          );

          // Return 200 so Safepay knows that
          // the webhook was received.
          return res.json({
            received:
              true,

            orderFound:
              false,
          });
        }

        // ===================================
        // ORDER FOUND
        // ===================================

        console.log(
          "================================="
        );

        console.log(
          "ORDER FOUND"
        );

        console.log(
          "Order:",
          order.orderNumber
        );

        console.log(
          "Current payment status:",
          order.paymentStatus
        );

        console.log(
          "Current order status:",
          order.status
        );

        console.log(
          "================================="
        );

        // ===================================
        // GET EVENT
        // ===================================

        const eventType =
          payload?.type ||
          payload?.event ||
          payload?.data?.type ||
          payload?.data?.event ||
          payload?.data?.payment?.type ||
          payload?.data?.payment?.event ||
          "";

        // ===================================
        // GET STATUS
        // ===================================

        const status =
          payload?.status ||
          payload?.data?.status ||
          payload?.data?.payment_status ||
          payload?.data?.paymentStatus ||
          payload?.data?.payment?.status ||
          "";

        // ===================================
        // GET STATE
        // ===================================

        const state =
          payload?.state ||
          payload?.data?.state ||
          payload?.data?.payment?.state ||
          "";

        // ===================================
        // NORMALIZE
        // ===================================

        const normalizedEvent =
          String(
            eventType
          )
            .trim()
            .toLowerCase();

        const normalizedStatus =
          String(
            status
          )
            .trim()
            .toLowerCase();

        const normalizedState =
          String(
            state
          )
            .trim()
            .toLowerCase();

        console.log(
          "Safepay event:",
          normalizedEvent
        );

        console.log(
          "Safepay status:",
          normalizedStatus
        );

        console.log(
          "Safepay state:",
          normalizedState
        );

        // ===================================
        // SUCCESS CHECK
        // ===================================

        const successful =
          normalizedEvent ===
            "payment.completed" ||

          normalizedEvent ===
            "payment.success" ||

          normalizedEvent ===
            "payment.succeeded" ||

          normalizedEvent ===
            "payment.paid" ||

          normalizedStatus ===
            "success" ||

          normalizedStatus ===
            "successful" ||

          normalizedStatus ===
            "paid" ||

          normalizedStatus ===
            "completed" ||

          normalizedStatus ===
            "succeeded" ||

          normalizedState ===
            "paid" ||

          normalizedState ===
            "completed" ||

          normalizedState ===
            "succeeded" ||

          normalizedState ===
            "payment_completed";

        console.log(
          "Payment successful:",
          successful
        );

        // ===================================
        // MARK PAID
        // ===================================

        if (
          successful &&
          order.paymentStatus !==
            "paid"
        ) {
          console.log(
            "================================="
          );

          console.log(
            "MARKING ORDER AS PAID"
          );

          console.log(
            "Order:",
            order.orderNumber
          );

          console.log(
            "================================="
          );

          order.paymentStatus =
            "paid";

          order.status =
            "confirmed";

          await order.save();

          console.log(
            "Order payment status updated."
          );

          // =================================
          // DECREMENT STOCK
          // =================================

          await decrementStock(
            order.items
          );

          console.log(
            "Stock decremented."
          );

          console.log(
            `Order ${order.orderNumber} marked PAID.`
          );
        }

        // ===================================
        // ALREADY PAID
        // ===================================

        else if (
          order.paymentStatus ===
          "paid"
        ) {
          console.log(
            `Order ${order.orderNumber} is already PAID.`
          );
        }

        // ===================================
        // PAYMENT NOT RECOGNIZED
        // ===================================

        else {
          console.log(
            "================================="
          );

          console.log(
            "WEBHOOK RECEIVED BUT PAYMENT STATUS WAS NOT RECOGNIZED"
          );

          console.log(
            "Event:",
            normalizedEvent
          );

          console.log(
            "Status:",
            normalizedStatus
          );

          console.log(
            "State:",
            normalizedState
          );

          console.log(
            "================================="
          );
        }

        // ===================================
        // SUCCESS RESPONSE
        // ===================================

        return res.json({
          received:
            true,

          orderFound:
            true,

          orderNumber:
            order.orderNumber,

          paymentStatus:
            order.paymentStatus,
        });
      } catch (error) {
        // ===================================
        // WEBHOOK ERROR
        // ===================================

        console.error(
          "================================="
        );

        console.error(
          "SAFEPAY WEBHOOK ERROR"
        );

        console.error(
          error
        );

        console.error(
          "================================="
        );

        return res
          .status(400)
          .json({
            message:
              error.message ||
              "Webhook processing failed.",
          });
      }
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
