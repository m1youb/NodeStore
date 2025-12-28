import bcrypt from 'bcryptjs';
import { getPool } from '../config/dbConnect.js';

class User {
    static async create({ fullname, username, email, password, role = 'user' }) {
        const pool = getPool();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (fullname, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [fullname, username.toLowerCase().trim(), email.toLowerCase().trim(), hashedPassword, role]
        );

        return await User.findById(result.insertId);
    }

    static async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async findByEmail(email) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        return rows[0] || null;
    }

    static async findByUsername(username) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username.toLowerCase().trim()]);
        return rows[0] || null;
    }

    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async updateById(id, updates) {
        const pool = getPool();
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) return null;

        values.push(id);
        await pool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await User.findById(id);
    }

    static async deleteById(id) {
        const pool = getPool();
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
    }

    static async getCartItems(userId) {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT ci.*, p.* 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [userId]);

        return rows.map(row => ({
            _id: row.product_id,
            id: row.product_id,
            quantity: row.quantity,
            title: row.title,
            description: row.description,
            image: row.image,
            price: parseFloat(row.price),
            category: row.category,
            is_featured: row.is_featured,
            // Keep nested product for backward compatibility
            product: {
                id: row.product_id,
                title: row.title,
                description: row.description,
                image: row.image,
                price: parseFloat(row.price),
                category: row.category,
                is_featured: row.is_featured
            }
        }));
    }

    static async addToCart(userId, productId, quantity = 1) {
        const pool = getPool();

        // Check if item already exists in cart
        const [existing] = await pool.query(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Update quantity
            await pool.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, userId, productId]
            );
        } else {
            // Insert new item
            await pool.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
        }

        return await User.getCartItems(userId);
    }

    static async removeFromCart(userId, productId) {
        const pool = getPool();
        await pool.query(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return await User.getCartItems(userId);
    }

    static async updateCartItemQuantity(userId, productId, quantity) {
        const pool = getPool();

        if (quantity <= 0) {
            return await User.removeFromCart(userId, productId);
        }

        await pool.query(
            'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
        return await User.getCartItems(userId);
    }

    static async clearCart(userId) {
        const pool = getPool();
        await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    }
}

export default User;