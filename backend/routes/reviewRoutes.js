import express from "express";

import {
  getApprovedReviews,
  getAdminReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getApprovedReviews);

router.get("/admin", getAdminReviews);

router.post("/", createReview);

router.put("/:id/status", updateReviewStatus);

router.delete("/:id", deleteReview);

export default router;
