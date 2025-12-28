import express from 'express';
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { connectDatabase } from '../config/dbConnect.js';
import { serverLogger } from '../logs/server/logger.js';
import User from '../model/user.model.js';
import Product from '../model/product.model.js';
import Coupon from '../model/coupon.model.js';
import Order from '../model/order.model.js';
import authRoutes from '../routes/auth/auth.routes.js';
import productRoutes from '../routes/products/product.routes.js';
import cartRoutes from '../routes/products/cart.routes.js';
import couponRoutes from '../routes/products/coupons.routes.js';
import paymentRoutes from "../routes/products/order.routes.js";
import analyticsRoutes from "../routes/products/analytics.routes.js";
import reviewRoutes from "../routes/reviews/review.routes.js";
import wishlistRoutes from '../routes/products/wishlist.routes.js';
import adminRoutes from '../routes/admin/admin.routes.js';

dotenv.config();

// Set default environment variables for demo mode
process.env.PORT = process.env.PORT || '5000';
process.env.URL_PREFIX = process.env.URL_PREFIX || 'http://localhost:5173';
process.env.ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY || 'demo_access_token_secret_key';
process.env.REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || 'demo_refresh_token_secret_key';

// MySQL Configuration
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.DB_NAME = process.env.DB_NAME || 'core_systems';

const app = express();

// app middlewares
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5000"],
    credentials: true,
}));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
}));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// app routes
// Test endpoint to verify uploads directory
app.get('/test-uploads', async (req, res) => {
    const fs = await import('fs');
    const uploadsPath = path.join(__dirname, "../uploads");
    fs.readdir(uploadsPath, (err, files) => {
        if (err) return res.status(500).json({ error: err.message, path: uploadsPath });
        res.json({
            uploadsPath,
            totalFiles: files.length,
            files,
            sampleUrls: files.slice(0, 3).map(f => `http://localhost:5000/uploads/${f}`)
        });
    });
});

app.use("/uploads", (req, res, next) => {
    console.log(`[Static] Request for: ${req.url}`);
    next();
}, express.static(path.join(__dirname, "../uploads"))); // Serve uploaded files
app.use("/mcollections/auth", authRoutes);
app.use("/mcollections/products", productRoutes);
app.use("/mcollections/cart", cartRoutes);
app.use("/mcollections/coupons", couponRoutes);
app.use("/mcollections/payment", paymentRoutes);
app.use("/mcollections/reviews", reviewRoutes);
app.use("/mcollections/wishlist", wishlistRoutes);
app.use("/mcollections/analytics", analyticsRoutes);
app.use("/mcollections/admin", adminRoutes);

app.listen(process.env.PORT, () => {
    connectDatabase();
    serverLogger.info(`Server fired up, link => http://localhost:${process.env.PORT}/mcollections`);
});