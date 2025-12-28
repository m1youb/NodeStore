import { getPool } from '../config/dbConnect.js';

class Coupon {
    static async create({ code, discount_percentage, expiration_date, user_id, is_active = true }) {
        const pool = getPool();

        const [result] = await pool.query(
            'INSERT INTO coupons (code, discount_percentage, expiration_date, user_id, is_active) VALUES (?, ?, ?, ?, ?)',
            [code, discount_percentage, expiration_date, user_id, is_active]
        );

        return await Coupon.findById(result.insertId);
    }

    static async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);

        if (rows.length === 0) return null;

        return Coupon.formatCoupon(rows[0]);
    }

    static async findByCode(code) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ?', [code]);

        if (rows.length === 0) return null;

        return Coupon.formatCoupon(rows[0]);
    }

    static async findOne(filters) {
        const pool = getPool();
        const conditions = [];
        const params = [];

        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined) {
                conditions.push(`${key} = ?`);
                params.push(filters[key]);
            }
        });

        if (conditions.length === 0) return null;

        const [rows] = await pool.query(
            `SELECT * FROM coupons WHERE ${conditions.join(' AND ')} LIMIT 1`,
            params
        );

        if (rows.length === 0) return null;

        return Coupon.formatCoupon(rows[0]);
    }

    static async findOneAndUpdate(filters, updates) {
        const pool = getPool();

        // Find the coupon first
        const coupon = await Coupon.findOne(filters);
        if (!coupon) return null;

        // Update it
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) return coupon;

        values.push(coupon.id);
        await pool.query(
            `UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await Coupon.findById(coupon.id);
    }

    static async findByUserId(userId) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM coupons WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        return rows.map(Coupon.formatCoupon);
    }

    static async findAll() {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        return rows.map(Coupon.formatCoupon);
    }

    static async deleteById(id) {
        const pool = getPool();
        const [result] = await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async save(coupon) {
        // This method is for compatibility with Mongoose-style code
        if (coupon.id) {
            return await Coupon.findOneAndUpdate({ id: coupon.id }, coupon);
        }
        return coupon;
    }

    // Helper method to format coupon data
    static formatCoupon(row) {
        if (!row) return null;

        const formatted = {
            _id: row.id,
            id: row.id,
            code: row.code,
            discountPercentage: row.discount_percentage,
            discount_percentage: row.discount_percentage,
            expirationDate: row.expiration_date,
            expiration_date: row.expiration_date,
            isActive: Boolean(row.is_active),
            is_active: Boolean(row.is_active),
            userId: row.user_id,
            user_id: row.user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            // Add save method to instance
            save: async function () {
                return await Coupon.save(this);
            }
        };

        return formatted;
    }
}

export default Coupon;