import { Router, Request, Response } from 'express';
import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/auth.js';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
      `,
      [username, email, passwordHash]
    );

    const token = generateToken(result.rows[0].id, 'user');

    res.status(201).json({
      success: true,
      user: result.rows[0],
      token
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, password_hash FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, 'user');

    res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Demo admin login (for development)
router.post('/admin-login', async (req: Request, res: Response) => {
  const { password } = req.body;

  // Simple demo password
  if (password !== 'admin123') {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Create or get admin user
  try {
    const result = await pool.query(
      `SELECT id FROM users WHERE username = 'admin' LIMIT 1`
    );

    let adminId: string;

    if (result.rows.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const createResult = await pool.query(
        `INSERT INTO users (username, email, password_hash) VALUES ('admin', 'admin@webkuhmanis.local', $1) RETURNING id`,
        [passwordHash]
      );
      adminId = createResult.rows[0].id;
    } else {
      adminId = result.rows[0].id;
    }

    const token = generateToken(adminId, 'admin');

    res.json({
      success: true,
      user: { id: adminId, username: 'admin', role: 'admin' },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Admin login failed' });
  }
});

export default router;
