import pool from './connection.js';

export const runMigrations = async () => {
  try {
    console.log('Running migrations...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        coins DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ users table created');

    // Create admin_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID,
        action VARCHAR(255) NOT NULL,
        target_id UUID,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id)
      );
    `);
    console.log('✓ admin_logs table created');

    // Create manual_payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manual_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        proof_image VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        otp_code VARCHAR(10),
        otp_expires_at TIMESTAMP,
        otp_used_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ manual_payments table created');

    // Create otp_attempts table for rate limiting
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        payment_id UUID NOT NULL,
        attempt_count INT DEFAULT 0,
        last_attempt TIMESTAMP,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_id) REFERENCES manual_payments(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ otp_attempts table created');

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

runMigrations().then(() => process.exit(0));
