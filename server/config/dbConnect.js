import mysql from 'mysql2/promise';
import { dbLogger } from '../logs/database/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

let pool;

export const connectDatabase = async () => {
    try {
        // First, create the database if it doesn't exist
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'core_systems'}`);
        await tempConnection.end();

        // Now create connection pool to the database
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'core_systems',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test connection
        const connection = await pool.getConnection();
        dbLogger.info('MySQL Database successfully Connected');
        connection.release();

        // Create tables if they don't exist
        await createTables();

        // Seed admin user if doesn't exist
        await seedAdminUser();

        return pool;
    } catch (error) {
        dbLogger.error({ name: error.name, message: error.message, stack: error.stack });
        process.exit(1);
    }
};

const createTables = async () => {
    try {
        // Create Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create Products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                image TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                is_featured BOOLEAN DEFAULT FALSE,
                stock_count INT DEFAULT 0,
                specs JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_featured (is_featured),
                INDEX idx_stock (stock_count)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create Cart Items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
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

        // Create Orders table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                stripe_session_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create Order Items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create Coupons table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                discount_percentage INT NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
                expiration_date DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                user_id INT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_code (code),
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create Reviews table (Part 3 Requirement)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                INDEX idx_product (product_id),
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        dbLogger.info('Database tables created successfully');
    } catch (error) {
        dbLogger.error('Error creating tables:', error);
        throw error;
    }
};

const seedAdminUser = async () => {
    try {
        // Ensure specs column exists (migration)
        try {
            await pool.query('ALTER TABLE products ADD COLUMN specs JSON');
            dbLogger.info('Added specs column to products table');
        } catch (e) {
            // Column likely exists, ignore
        }

        // Ensure stock_count column exists (migration)
        try {
            await pool.query('ALTER TABLE products ADD COLUMN stock_count INT DEFAULT 0');
            dbLogger.info('Added stock_count column to products table');
        } catch (e) {
            // Column likely exists, ignore
        }

        // Check if any admin user exists
        const [admins] = await pool.query(
            'SELECT * FROM users WHERE role = ? LIMIT 1',
            ['admin']
        );

        if (admins.length === 0) {
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin', 10);

            await pool.query(
                'INSERT INTO users (fullname, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['System Administrator', 'admin', 'admin@coresystems.tech', hashedPassword, 'admin']
            );

            console.log('\n✅ Default admin user created:');
            console.log('   Email: admin@coresystems.tech');
            console.log('   Password: admin');
            console.log('   ⚠️  Please change the password after first login!\n');
            dbLogger.info('Admin user seeded successfully');
        } else {
            dbLogger.info('Admin user already exists, skipping seed');
        }
    } catch (error) {
        dbLogger.error('Error seeding admin user:', error);
        // Don't throw - allow server to continue even if seeding fails
    }
};

export const getPool = () => {
    if (!pool) {
        throw new Error('Database pool not initialized. Call connectDatabase() first.');
    }
    return pool;
};

export default { connectDatabase, getPool };