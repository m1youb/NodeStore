// Run this script to fix the cart_items table column names
// node fix-cart-table.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixCartTable() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT || 3306
    });

    try {
        console.log('Connected to database');

        // Check if table exists and what columns it has
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM cart_items
        `);

        console.log('Current cart_items columns:', columns.map(c => c.Field));

        // Check if wrong column names exist
        const hasUserId = columns.some(c => c.Field === 'userId');
        const hasProductId = columns.some(c => c.Field === 'productId');

        if (hasUserId || hasProductId) {
            console.log('Found incorrect column names. Dropping and recreating table...');

            // Drop the table
            await connection.query('DROP TABLE IF NOT EXISTS cart_items');

            // Recreate with correct schema
            await connection.query(`
                CREATE TABLE cart_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    product_id INT NOT NULL,
                    quantity INT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_product (user_id, product_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);

            console.log('✅ Table recreated with correct column names');
        } else {
            console.log('✅ Table already has correct column names (user_id, product_id)');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

fixCartTable();
