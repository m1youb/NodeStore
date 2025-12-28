# MySQL Migration Complete! 🎉

## ✅ What Changed

Your NodeStore/CORE SYSTEMS project has been successfully migrated from **MongoDB** to **MySQL**.

---

## 📋 Changes Made

### 1. **Database Connection** (`config/dbConnect.js`)
- ✅ Replaced Mongoose with MySQL2
- ✅ Implemented connection pooling
- ✅ Auto-creates database and tables on startup
- ✅ Proper error handling and logging

### 2. **Models Converted**
All Mongoose models have been converted to MySQL:

#### **User Model** (`model/user.model.js`)
- ✅ User authentication (bcrypt password hashing)
- ✅ Cart management (separate `cart_items` table)
- ✅ Role-based access (user/admin)
- ✅ CRUD operations

#### **Product Model** (`model/product.model.js`)
- ✅ Product management
- ✅ Featured products
- ✅ Category filtering
- ✅ Price as DECIMAL for accuracy

#### **Order Model** (`model/order.model.js`)
- ✅ Order creation with transactions
- ✅ Order items (separate `order_items` table)
- ✅ Stripe session tracking
- ✅ User order history

#### **Coupon Model** (`model/coupon.model.js`)
- ✅ Coupon code management
- ✅ Discount percentage validation
- ✅ Expiration dates
- ✅ User-specific coupons

### 3. **Database Schema**

#### Tables Created:
1. **users** - User accounts and authentication
2. **products** - Product catalog
3. **cart_items** - Shopping cart (user-product relationship)
4. **orders** - Order headers
5. **order_items** - Order line items
6. **coupons** - Discount coupons

All tables include:
- Auto-incrementing IDs
- Timestamps (`created_at`, `updated_at`)
- Proper indexes for performance
- Foreign key constraints
- UTF-8 character support

### 4. **Configuration**
- ✅ Updated `.env.example` with MySQL settings
- ✅ Added MySQL defaults to `src/index.js`
- ✅ Installed `mysql2` package

---

## 🚀 How to Run

### 1. **Make Sure MySQL is Running**
Your MySQL server should be running on:
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: (empty)

### 2. **Start the Server**
```bash
cd server
npm run dev
```

The server will:
1. Connect to MySQL
2. Create the `core_systems` database (if it doesn't exist)
3. Create all tables automatically
4. Start listening on port 5000

### 3. **Verify Connection**
You should see in the logs:
```
MySQL Database successfully Connected
Database tables created successfully
Server fired up, link => http://localhost:5000/mcollections
```

---

## 🗄️ Database Structure

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Cart Items Table
```sql
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
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    stripe_session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### Coupons Table
```sql
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percentage INT NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    expiration_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `server` directory (or use the defaults):

```env
# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=core_systems

# Server
PORT=5000
URL_PREFIX=http://localhost:5173

# JWT
ACCESS_TOKEN_KEY=your_secret_key
REFRESH_TOKEN_KEY=your_refresh_key
```

---

## 💡 Key Differences from MongoDB

### 1. **IDs**
- MongoDB: ObjectId (string like `"507f1f77bcf86cd799439011"`)
- MySQL: Auto-increment integers (1, 2, 3, etc.)

### 2. **Relationships**
- MongoDB: Embedded documents or references
- MySQL: Foreign keys with CASCADE delete

### 3. **Cart Storage**
- MongoDB: Array embedded in user document
- MySQL: Separate `cart_items` table

### 4. **Queries**
- MongoDB: `User.findOne({ email })`
- MySQL: `User.findByEmail(email)`

### 5. **Transactions**
- MongoDB: Session-based transactions
- MySQL: Connection-based transactions (used in Order creation)

---

## 🎯 Model API (Backward Compatible)

The models maintain similar APIs to Mongoose for easy migration:

```javascript
// User
await User.create({ fullname, username, email, password });
await User.findById(id);
await User.findByEmail(email);
await User.validatePassword(plain, hashed);
await User.addToCart(userId, productId, quantity);
await User.getCartItems(userId);

// Product
await Product.create({ title, description, price, category });
await Product.findById(id);
await Product.findAll();
await Product.getFeaturedProducts();
await Product.updateById(id, updates);

// Order
await Order.create({ user_id, products, total_amount, stripe_session_id });
await Order.findById(id);
await Order.findByUserId(userId);

// Coupon
await Coupon.create({ code, discount_percentage, expiration_date, user_id });
await Coupon.findByCode(code);
await Coupon.findOne({ code, userId, isActive: true });
```

---

## 🐛 Troubleshooting

### MySQL Not Running
```bash
# Windows
net start MySQL80

# Or start from Services (services.msc)
```

### Can't Connect to MySQL
- Check if MySQL is running on port 3306
- Verify root user has no password (or update .env)
- Check firewall settings

### Tables Not Created
- Check server logs for errors
- Manually create database: `CREATE DATABASE core_systems;`
- Restart the server

### Permission Errors
```sql
GRANT ALL PRIVILEGES ON core_systems.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 Viewing Your Data

### Using MySQL Workbench
1. Connect to localhost:3306
2. Select `core_systems` database
3. Browse tables

### Using Command Line
```bash
mysql -u root -p
USE core_systems;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM products;
```

---

## ✅ Testing the Migration

1. **Start the server** - Should connect without errors
2. **Create a user** - Sign up through the frontend
3. **Add products** - Use admin dashboard
4. **Add to cart** - Test cart functionality
5. **Create order** - Test checkout flow

---

## 🎉 Benefits of MySQL

1. **ACID Compliance** - Guaranteed data consistency
2. **Transactions** - Safe order processing
3. **Foreign Keys** - Data integrity
4. **Decimal Precision** - Accurate price calculations
5. **Mature Ecosystem** - Tons of tools and support
6. **Performance** - Optimized for relational data

---

**Your CORE SYSTEMS project is now running on MySQL! 🚀**
