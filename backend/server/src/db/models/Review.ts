import mongoose from "mongoose";

/*
    Type interface.
*/
export interface ReviewDocument {
  eid: string;
  reviewer: string;
  review: string;
  rating: number;
}

const reviewSchema = new mongoose.Schema(
  {
    eid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    review: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
    Review Model
*/
const ReviewModel = mongoose.model("Review", reviewSchema);
export default ReviewModel;
