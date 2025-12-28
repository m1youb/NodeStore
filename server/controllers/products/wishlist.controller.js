import Wishlist from '../../model/wishlist.model.js';
import { dbLogger } from '../../logs/database/database.js';

export const getUserWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await Wishlist.getByUserId(userId);

        return res.status(200).json({
            success: true,
            message: 'Wishlist retrieved successfully',
            wishlist,
            count: wishlist.length
        });
    } catch (error) {
        dbLogger.error('Error getting wishlist:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const added = await Wishlist.add(userId, productId);

        if (!added) {
            return res.status(409).json({ success: false, message: 'Product already in wishlist' });
        }

        return res.status(201).json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (error) {
        dbLogger.error('Error adding to wishlist:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const removed = await Wishlist.remove(userId, productId);

        if (!removed) {
            return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
        }

        return res.status(200).json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (error) {
        dbLogger.error('Error removing from wishlist:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Wishlist.clearWishlist(userId);

        return res.status(200).json({
            success: true,
            message: `Removed ${count} items from wishlist`
        });
    } catch (error) {
        dbLogger.error('Error clearing wishlist:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
