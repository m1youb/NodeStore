import { serverLogger } from "../../logs/server/logger.js";
import User from "../../model/user.model.js";
import Product from "../../model/product.model.js";

export const putInCart = async function (req, res) {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(404).json({ success: false, message: "Couldn't find user" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Couldn't find product" });
        }

        const cart = await User.addToCart(user.id, productId, 1);
        return res.status(200).json({ success: true, message: "Added to cart", cart });
    } catch (error) {
        serverLogger.info(error.stack);
        return res.status(500).json({ success: false, message: error.message, trace: error.stack });
    }
}

export const removeFromCart = async function (req, res) {
    try {
        const { productId } = req.params;
        const user = req.user;

        if (!productId) {
            return res.status(404).json({ success: false, message: "Didnt provide id" });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "Couldn't find user" });
        }

        const cart = await User.removeFromCart(user.id, productId);
        return res.status(200).json({ success: true, message: "Removed succesfully", cart });
    } catch (error) {
        serverLogger.info(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getCart = async function (req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ success: false, message: "Couldn't find user" });
        }

        const cart = await User.getCartItems(user.id);
        return res.status(200).json({ success: true, message: "Found items succesfully", cart });
    } catch (error) {
        serverLogger.info(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateQuantity = async function (req, res) {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(404).json({ success: false, message: "Couldn't find user" });
        }

        const cart = await User.updateCartItemQuantity(user.id, productId, quantity);
        return res.status(200).json({ success: true, message: "Updated cart", cart });

    } catch (error) {
        serverLogger.info(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteItemsFromCart = async function (req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ success: false, message: "Couldn't find user" });
        }

        await User.clearCart(user.id);
        return res.status(200).json({ success: true, message: `Cart is now empty`, cart: [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}