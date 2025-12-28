import express from 'express';
import { authCheck } from '../../middleware/authCheck.middleware.js';
import {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} from '../../controllers/products/wishlist.controller.js';

const wishlistRoutes = express.Router();

// All wishlist routes require authentication
wishlistRoutes.get('/', authCheck, getUserWishlist);
wishlistRoutes.post('/', authCheck, addToWishlist);
wishlistRoutes.delete('/:productId', authCheck, removeFromWishlist);
wishlistRoutes.delete('/', authCheck, clearWishlist);

export default wishlistRoutes;
