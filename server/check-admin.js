import { getPool, connectDatabase } from './config/dbConnect.js';
import bcrypt from 'bcryptjs';

async function checkAndCreateAdmin() {
    try {
        // Connect to database first
        await connectDatabase();
        const pool = getPool();

        // Check if admin user exists
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);

        if (users.length > 0) {
            console.log('✅ Admin user exists:');
            console.log('   Username:', users[0].username);
            console.log('   Email:', users[0].email);
            console.log('   Role:', users[0].role);
            console.log('   ID:', users[0].id);

            // Test password
            const isPasswordCorrect = await bcrypt.compare('admin', users[0].password);
            console.log('   Password "admin" is valid:', isPasswordCorrect);

            if (!isPasswordCorrect) {
                console.log('\n⚠️  Password mismatch! Updating password to "admin"...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('admin', salt);
                await pool.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
                console.log('✅ Password updated successfully!');
            }
        } else {
            console.log('❌ Admin user NOT found. Creating admin user...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            await pool.query(
                'INSERT INTO users (fullname, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['Admin User', 'admin', 'admin@example.com', hashedPassword, 'admin']
            );

            console.log('✅ Admin user created successfully!');
            console.log('   Username: admin');
            console.log('   Password: admin');
            console.log('   Email: admin@example.com');
        }

        // List all users
        const [allUsers] = await pool.query('SELECT id, username, email, role FROM users');
        console.log('\n📋 All users in database:');
        allUsers.forEach(user => {
            console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Wait a bit for database connection
setTimeout(() => {
    checkAndCreateAdmin();
}, 2000);
