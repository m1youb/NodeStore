import { getPool } from '../config/dbConnect.js';

class Order {
    static async create({ user_id, products, total_amount, stripe_session_id, shipping_address, city, country, postal_code, payment_method = 'cash_on_delivery' }) {
        const pool = getPool();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Create order with shipping details
            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, total_amount, shipping_address, city, country, postal_code, payment_method, stripe_session_id, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [user_id, total_amount, shipping_address || null, city || null, country || null, postal_code || null, payment_method, stripe_session_id || null]
            );

            const orderId = orderResult.insertId;

            // Create order items
            for (const item of products) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.id || item.product, item.quantity, item.price]
                );
            }

            await connection.commit();
            return await Order.findById(orderId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findById(id) {
        const pool = getPool();

        // Get order
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) return null;

        const order = orders[0];

        // Get order items with product details
        const [items] = await pool.query(`
            SELECT oi.*, p.title, p.description, p.image, p.category
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);

        return {
            _id: order.id,
            id: order.id,
            user: order.user_id,
            products: items.map(item => ({
                product: {
                    _id: item.product_id,
                    id: item.product_id,
                    title: item.title,
                    description: item.description,
                    image: item.image,
                    category: item.category
                },
                quantity: item.quantity,
                price: parseFloat(item.price)
            })),
            totalamount: parseFloat(order.total_amount),
            total_amount: parseFloat(order.total_amount),
            shipping_address: order.shipping_address,
            city: order.city,
            country: order.country,
            postal_code: order.postal_code,
            payment_method: order.payment_method,
            status: order.status,
            stripeSessionId: order.stripe_session_id,
            stripe_session_id: order.stripe_session_id,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            created_at: order.created_at,
            updated_at: order.updated_at
        };
    }

    static async findByUserId(userId) {
        const pool = getPool();
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        const ordersWithItems = [];
        for (const order of orders) {
            ordersWithItems.push(await Order.findById(order.id));
        }

        return ordersWithItems;
    }

    static async findAll() {
        const pool = getPool();
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');

        const ordersWithItems = [];
        for (const order of orders) {
            ordersWithItems.push(await Order.findById(order.id));
        }

        return ordersWithItems;
    }

    static async updateStatus(orderId, status) {
        const pool = getPool();
        await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        return await Order.findById(orderId);
    }

    static async deleteById(id) {
        const pool = getPool();
        // Order items will be deleted automatically due to CASCADE
        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

export default Order;
