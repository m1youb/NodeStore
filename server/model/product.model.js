import { getPool } from '../config/dbConnect.js';

class Product {
    static async create({ title, description, image, price, category, stock_count = 0, specs = [], is_featured = false }) {
        const pool = getPool();

        const [result] = await pool.query(
            'INSERT INTO products (title, description, image, price, category, stock_count, specs, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, image, price, category, stock_count, JSON.stringify(specs), is_featured]
        );

        return await Product.findById(result.insertId);
    }

    static async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

        if (rows.length === 0) return null;

        return Product.formatProduct(rows[0]);
    }

    static async findByTitle(title) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM products WHERE title = ?', [title]);

        if (rows.length === 0) return null;

        return Product.formatProduct(rows[0]);
    }

    static async findAll(filters = {}) {
        const pool = getPool();
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (filters.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }

        if (filters.is_featured !== undefined) {
            query += ' AND is_featured = ?';
            params.push(filters.is_featured);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.query(query, params);
        return rows.map(Product.formatProduct);
    }

    static async findByCategory(category, filters = {}) {
        const pool = getPool();
        let query = 'SELECT * FROM products WHERE category = ?';
        const params = [category];

        // Apply price filters
        if (filters.minPrice !== null && filters.minPrice !== undefined) {
            query += ' AND price >= ?';
            params.push(filters.minPrice);
        }

        if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
            query += ' AND price <= ?';
            params.push(filters.maxPrice);
        }

        // Apply stock filter
        if (filters.inStockOnly) {
            query += ' AND stock_count > 0';
        }

        // Apply featured filter
        if (filters.featuredOnly) {
            query += ' AND is_featured = true';
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'price_asc':
                query += ' ORDER BY price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY price DESC';
                break;
            case 'popular':
                // For now, sort by featured + newest. Can be enhanced with sales data later
                query += ' ORDER BY is_featured DESC, created_at DESC';
                break;
            case 'newest':
            default:
                query += ' ORDER BY created_at DESC';
                break;
        }

        const [rows] = await pool.query(query, params);
        return rows.map(Product.formatProduct);
    }

    static async getFeaturedProducts() {
        return await Product.findAll({ is_featured: true });
    }

    static async updateById(id, updates) {
        const pool = getPool();
        const fields = [];
        const values = [];

        const allowedFields = ['title', 'description', 'image', 'price', 'category', 'stock_count', 'specs', 'is_featured'];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                const value = key === 'specs' ? JSON.stringify(updates[key]) : updates[key];
                values.push(value);
            }
        });

        if (fields.length === 0) return null;

        values.push(id);
        await pool.query(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await Product.findById(id);
    }

    static async deleteById(id) {
        const pool = getPool();
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async toggleFeatured(id) {
        const pool = getPool();
        await pool.query(
            'UPDATE products SET is_featured = NOT is_featured WHERE id = ?',
            [id]
        );
        return await Product.findById(id);
    }

    static async getRecommendedProducts(limit = 3) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT * FROM products ORDER BY RAND() LIMIT ?',
            [limit]
        );
        return rows.map(Product.formatProduct);
    }

    static async searchProducts(query, limit = 5) {
        const pool = getPool();
        const searchTerm = `%${query}%`;

        const [rows] = await pool.query(
            `SELECT * FROM products 
             WHERE title LIKE ? 
                OR description LIKE ? 
                OR category LIKE ?
             ORDER BY 
                CASE 
                    WHEN title LIKE ? THEN 1
                    WHEN category LIKE ? THEN 2
                    ELSE 3
                END,
                created_at DESC
             LIMIT ?`,
            [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]
        );

        return rows.map(Product.formatProduct);
    }

    static async getProductsByCategory() {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM products 
            GROUP BY category
        `);
        return rows;
    }

    // Helper method to format product data
    static formatProduct(row) {
        if (!row) return null;

        return {
            _id: row.id,
            id: row.id,
            title: row.title,
            description: row.description,
            image: row.image,
            price: parseFloat(row.price),
            category: row.category,
            stockCount: row.stock_count,
            stock_count: row.stock_count,
            specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || []),
            isFeatured: Boolean(row.is_featured),
            is_featured: Boolean(row.is_featured),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }
}

export default Product;
