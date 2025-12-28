import express from "express"
import { authCheck } from "../../middleware/authCheck.middleware.js";
import { adminCheck } from "../../middleware/adminCheck.middleware.js";
import { createSession, sessionStatus, createCODOrder, getAllOrders, updateOrderStatus, deleteOrder } from "../../controllers/products/order.controller.js";
const paymentRoutes = express.Router();

// Stripe payment routes
paymentRoutes.post("/session", authCheck, createSession);
paymentRoutes.post("/session_status/:sessionId", authCheck, sessionStatus);

// Cash on Delivery routes
paymentRoutes.post("/create-cod-order", authCheck, createCODOrder);

// Admin routes
paymentRoutes.get("/all-orders", authCheck, adminCheck, getAllOrders);
paymentRoutes.put("/update-status/:id", authCheck, adminCheck, updateOrderStatus);
paymentRoutes.delete("/delete-order/:id", authCheck, adminCheck, deleteOrder);

export default paymentRoutes;