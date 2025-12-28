import Review from "../../model/review.model.js";
import { dbLogger } from "../../logs/database/database.js";

export const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const user = req.user;

        if (!productId || !rating) {
            return res.status(400).json({ success: false, message: "Product ID and rating are required" });
        }

        await Review.create({
            userId: user.id,
            productId,
            rating,
            comment
        });

        return res.status(201).json({ success: true, message: "Review added successfully" });
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.findByProductId(productId);
        const stats = await Review.getAverageRating(productId);

        return res.status(200).json({
            success: true,
            reviews,
            averageRating: stats.avgRating || 0,
            totalReviews: stats.count || 0
        });
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
};
