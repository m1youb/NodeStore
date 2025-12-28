import { getPool } from '../config/dbConnect.js';

class Wishlist {
    static async add(userId, productId) {
        const pool = getPool();

        try {
            await pool.query(
                'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
                [userId, productId]
            );
            return true;
        } catch (error) {
            // Duplicate entry error (already in wishlist)
            if (error.code === 'ER_DUP_ENTRY') {
                return false;
            }
            throw error;
        }
    }

    static async remove(userId, productId) {
        const pool = getPool();
        const [result] = await pool.query(
            'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.affectedRows > 0;
    }

    static async getByUserId(userId) {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT 
                w.id,
                w.user_id,
                w.product_id,
                w.created_at,
                p.title,
                p.description,
                p.image,
                p.price,
                p.category,
                p.stock_count,
                p.is_featured
            FROM wishlists w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [userId]);

        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            productId: row.product_id,
            createdAt: row.created_at,
            product: {
                id: row.product_id,
                title: row.title,
                description: row.description,
                image: row.image,
                price: parseFloat(row.price),
                category: row.category,
                stock_count: row.stock_count,
                is_featured: Boolean(row.is_featured)
            }
        }));
    }

    static async isInWishlist(userId, productId) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return rows.length > 0;
    }

    static async clearWishlist(userId) {
        const pool = getPool();
        const [result] = await pool.query(
            'DELETE FROM wishlists WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows;
    }
}

export default Wishlist;
