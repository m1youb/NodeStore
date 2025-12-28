import Coupon from "../../model/coupon.model.js";
import User from "../../model/user.model.js";
import { serverLogger } from "../../logs/server/logger.js"

export const getCouponForUser = async function (req, res) {
    try {
        const user = req.user._id || req.user.id;
        const findUser = await User.findById(user);
        console.log('User for coupon lookup:', findUser);

        if (!findUser) {
            return res.status(404).json({ success: false, message: "User wasn't found, maybe you should refresh, or you're not authenticated" });
        }

        const userCoupon = await Coupon.findOne({ user_id: findUser.id, is_active: true });

        // Return 200 even if no coupon exists - this is not an error condition
        if (!userCoupon) {
            console.log('No active coupon found for user');
            return res.status(200).json({ success: true, message: "No active coupon found", coupon: null })
        }

        console.log('User coupon:', userCoupon);
        return res.status(200).json({ success: true, message: "Successfully got coupon", coupon: userCoupon });
    } catch (error) {
        console.error('Get coupon error:', error);
        serverLogger.info(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const validateCoupon = async function (req, res) {
    try {
        const { code } = req.params;
        const userId = req.user._id;
        if (!code) {
            return res.status(400).json({ success: false, message: "Token wasn't provided properly by client" });
        }

        const coupon = await Coupon.findOne({ code, isActive: true, userId });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Couldn't find coupon" });
        }

        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return res.status(404).json({ success: false, message: "Token expired" });
        }
        return res.status(200).json({ success: true, message: "Coupon retirevd succesfully " })
    } catch (error) {
        serverLogger.info(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}