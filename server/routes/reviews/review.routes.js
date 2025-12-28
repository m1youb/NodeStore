import express from "express";
import { addReview, getReviews } from "../../controllers/reviews/review.controller.js";
import { authCheck } from "../../middleware/authCheck.middleware.js";

const reviewRoutes = express.Router();

reviewRoutes.post("/", authCheck, addReview);
reviewRoutes.get("/:productId", getReviews);

export default reviewRoutes;
