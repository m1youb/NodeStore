import { getPool } from '../../config/dbConnect.js';
import { serverLogger } from '../../logs/server/logger.js';
import bcrypt from 'bcryptjs';

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
    try {
        const pool = getPool();

        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
        const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');

        res.json({
            success: true,
            stats: {
                totalUsers: userCount[0].count,
                totalProducts: productCount[0].count,
                totalOrders: orderCount[0].count
            }
        });
    } catch (error) {
        serverLogger.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const pool = getPool();

        const [users] = await pool.query(
            'SELECT id, fullname, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            users
        });
    } catch (error) {
        serverLogger.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, email, password, role } = req.body;
        const pool = getPool();

        const updates = {};
        if (fullname) updates.fullname = fullname;
        if (email) updates.email = email.toLowerCase().trim();
        if (role) updates.role = role;

        // Hash password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.password = hashedPassword;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await pool.query(
            `UPDATE users SET ${fields} WHERE id = ?`,
            values
        );

        // Get updated user
        const [users] = await pool.query(
            'SELECT id, fullname, username, email, role, created_at FROM users WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'User updated successfully',
            user: users[0]
        });
    } catch (error) {
        serverLogger.error('Error updating user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();

        // Prevent deleting yourself
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        serverLogger.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
