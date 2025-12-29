import stripe from "../../libs/stripe.js";
import { dbLogger } from "../../logs/database/database.js";
import Coupon from "../../model/coupon.model.js";
import dotenv from "dotenv"
import Order from "../../model/order.model.js";
import { getPool } from "../../config/dbConnect.js";
dotenv.config();

const createStripeCoupon = async function (percentage) {
    const coupon = await stripe.coupons.create({
        percent_off: percentage,
        duration: "once"
    })

    return coupon.id;
}

const createCoupon = async function (userId) {
    try {
        const newCoupon = await Coupon.create({
            userId: userId.toString(),
            code: "Mcollection" + Math.random().toString(36).substring(2, 8).toLowerCase(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            discountPercentage: 10
        })

        await newCoupon.save();
        return newCoupon;
    } catch (error) {
        dbLogger.info(error);
    }
}

export const createSession = async function (req, res) {
    try {
        const { products, code } = req.body;
        console.log(code);
        if (!products) {
            return res.status(404).json({ success: false, message: "User didn't provide token" });
        }
        if (!Array.isArray(products || products.length === 0)) {
            return res.status(400).json({ success: false, message: "Invalid or empty data" });
        }

        let totalAmount = 0;
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100); //Stripe required
            totalAmount += amount * product.quantity;

            return {
                //Stripe required
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.title,
                        images: [product.image]
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1
            }
        });

        let coupon = null;
        if (code) {
            coupon = await Coupon.findOne({ code, userId: req.user._id, isActive: true });
            if (coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.URL_PREFIX}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL_PREFIX}/purchase-cancel`,
            discounts: coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage)
                }
            ] : [],
            metadata: {
                userId: req.user.id,
                coupon: code,
                products: JSON.stringify(
                    products.map(p => ({
                        id: p._id,
                        price: p.price,
                        quantity: p.quantity
                    }))
                )
            }
        })

        // Store metadata globally for mock Stripe retrieval
        if (!global.mockSessionMetadata) {
            global.mockSessionMetadata = {};
        }
        global.mockSessionMetadata[session.id] = {
            userId: req.user.id,
            coupon: code,
            products: JSON.stringify(
                products.map(p => ({
                    id: p._id,
                    price: p.price,
                    quantity: p.quantity
                }))
            )
        };


        if (totalAmount >= 20000) {
            await createCoupon(req.user._id);
        }

        return res.status(200).json({ success: true, id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const sessionStatus = async function (req, res) {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            if (session.metadata.coupon) {
                const action = await Coupon.findOneAndUpdate({ code: session.metadata.coupon, userId: session.metadata.userId }, { isActive: false });
                await action.save();
            }

            const products = JSON.parse(session.metadata.products);
            console.log(products);
            const newOrder = await Order.create({
                user: session.metadata.userId,
                products: products.map(pr => ({
                    product: pr.id,
                    quantity: pr.quantity,
                    price: pr.price
                })),
                totalamount: session.amount_total / 100,
                stripeSessionId: session.id
            })

            await newOrder.save();
            res.status(200).json({ success: true, message: "Payment succesfull", order: newOrder._id });
        }
    } catch (error) {
        dbLogger.info("Error: " + error.name + " was found at " + error.trace);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const createCODOrder = async function (req, res) {
    try {
        const { products, shipping_address, city, country, postal_code, total_amount } = req.body;
        const userId = req.user.id || req.user._id;

        console.log('COD Order request:', { userId, products, shipping_address, city, country, postal_code, total_amount });

        // Validation
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
        }

        if (!shipping_address || !city || !country || !postal_code) {
            return res.status(400).json({ success: false, message: "All shipping details are required" });
        }

        if (!total_amount || total_amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid total amount" });
        }

        // Create order
        const newOrder = await Order.create({
            user_id: userId,
            products: products.map(p => ({
                id: p.id || p._id,
                quantity: p.quantity,
                price: p.price
            })),
            total_amount: total_amount,
            shipping_address,
            city,
            country,
            postal_code,
            payment_method: 'cash_on_delivery'
        });

        console.log('Order created:', newOrder);

        // Decrement stock for each product
        const pool = getPool();
        for (const product of products) {
            const productId = product.id || product._id;
            const quantity = product.quantity;

            try {
                await pool.query(
                    'UPDATE products SET stock_count = stock_count - ? WHERE id = ? AND stock_count >= ?',
                    [quantity, productId, quantity]
                );
                console.log(`Decremented stock for product ${productId} by ${quantity}`);
            } catch (error) {
                console.error(`Failed to decrement stock for product ${productId}:`, error);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Order placed successfully! You will pay on delivery.",
            order: newOrder
        });
    } catch (error) {
        console.error('Create COD order error:', error);
        dbLogger.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllOrders = async function (req, res) {
    try {
        const orders = await Order.findAll();
        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        dbLogger.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateOrderStatus = async function (req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const updatedOrder = await Order.updateStatus(id, status);

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        dbLogger.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getUserOrders = async function (req, res) {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await Order.findByUserId(userId);

        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        dbLogger.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteOrder = async function (req, res) {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        const deleted = await Order.deleteById(orderId);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.error('Delete order error:', error);
        dbLogger.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
