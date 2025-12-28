import express from 'express';
import { authCheck } from '../../middleware/authCheck.middleware.js';
import { adminCheck } from '../../middleware/adminCheck.middleware.js';
import {
    getAdminStats,
    getAllUsers,
    updateUser,
    deleteUser
} from '../../controllers/admin/admin.controller.js';

const adminRoutes = express.Router();

// All admin routes require authentication + admin role
adminRoutes.use(authCheck, adminCheck);

// Stats
adminRoutes.get('/stats', getAdminStats);

// User Management
adminRoutes.get('/users', getAllUsers);
adminRoutes.patch('/users/:id', updateUser);
adminRoutes.delete('/users/:id', deleteUser);

export default adminRoutes;
