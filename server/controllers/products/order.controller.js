import stripe from "../../libs/stripe.js";
import { dbLogger } from "../../logs/database/database.js";
import Coupon from "../../model/coupon.model.js";
import dotenv from "dotenv"
import Order from "../../model/order.model.js";
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