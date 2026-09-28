import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";

// @desc    Get approved reviews for the website
// @route   GET /api/reviews
// @access  Public
export const getApprovedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    status: "approved",
  }).sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Get all reviews for admin
// @route   GET /api/reviews/admin
// @access  Private
export const getAdminReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).sort({
    createdAt: -1,
  });

  res.json(reviews);
});

// @desc    Create a customer review
// @route   POST /api/reviews
// @access  Public
export const createReview = asyncHandler(async (req, res) => {
  const {
    name,
    city,
    rating,
    comment,
  } = req.body;

  if (!name || !rating || !comment) {
    res.status(400);
    throw new Error("Name, rating and comment are required.");
  }

  const review = await Review.create({
    name,
    city,
    rating,
    comment,
    status: "pending",
  });

  res.status(201).json(review);
});

// @desc    Update review status
// @route   PUT /api/reviews/:id/status
// @access  Private
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }

  const { status } = req.body;

  if (!["pending", "approved", "hidden"].includes(status)) {
    res.status(400);
    throw new Error("Invalid review status.");
  }

  review.status = status;

  const updatedReview = await review.save();

  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found.");
  }

  await review.deleteOne();

  res.json({
    message: "Review deleted.",
  });
});
