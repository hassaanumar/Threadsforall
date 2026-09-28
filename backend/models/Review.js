import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
