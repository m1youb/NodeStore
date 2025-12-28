import { getPool } from '../config/dbConnect.js';

class Review {
    static async create({ userId, productId, rating, comment }) {
        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, productId, rating, comment]
        );
        return result.insertId;
    }

    static async findByProductId(productId) {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT r.*, u.username, u.fullname 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [productId]);
        return rows;
    }

    static async getAverageRating(productId) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT AVG(rating) as avgRating, COUNT(*) as count FROM reviews WHERE product_id = ?',
            [productId]
        );
        return rows[0];
    }
}

export default Review;
