import { Router, Request, Response } from 'express';
import pool from '../db/connection.js';
import { generateOTP, hashOTP } from '../utils/otp.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get payment status
router.get('/payments/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT id, user_id, amount, status, otp_expires_at, created_at, updated_at
      FROM manual_payments
      WHERE id = $1 AND user_id = $2
      `,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Submit payment proof
router.post('/payments/upload', authMiddleware, async (req: Request, res: Response) => {
  const { amount, proof_image } = req.body;

  if (!amount || !proof_image) {
    return res.status(400).json({ error: 'Amount and proof image required' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO manual_payments (user_id, amount, proof_image, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING id, amount, status, created_at
      `,
      [req.userId, amount, proof_image]
    );

    res.status(201).json({
      success: true,
      paymentId: result.rows[0].id,
      message: 'Payment proof submitted, waiting for admin verification'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
});

// Verify OTP
router.post('/payments/:id/verify-otp', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: 'OTP required' });
  }

  try {
    // Get payment
    const paymentResult = await pool.query(
      `
      SELECT id, user_id, amount, status, otp_code, otp_expires_at, otp_used_at
      FROM manual_payments
      WHERE id = $1 AND user_id = $2
      `,
      [id, req.userId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Check rate limiting
    const attemptsResult = await pool.query(
      `SELECT attempt_count, locked_until FROM otp_attempts WHERE payment_id = $1`,
      [id]
    );

    let attempts = 0;
    if (attemptsResult.rows.length > 0) {
      attempts = attemptsResult.rows[0].attempt_count;
      if (attemptsResult.rows[0].locked_until && new Date(attemptsResult.rows[0].locked_until) > new Date()) {
        return res.status(429).json({ error: 'Too many attempts, try again later' });
      }
    }

    // Validate payment status
    if (payment.status !== 'approved') {
      return res.status(400).json({ error: 'Payment not in approved status' });
    }

    // Check expiry
    if (new Date() > new Date(payment.otp_expires_at)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Check if already used
    if (payment.otp_used_at) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    // Verify OTP
    const otpHash = hashOTP(otp);
    if (otpHash !== payment.otp_code) {
      // Increment attempts
      if (attemptsResult.rows.length > 0) {
        const newAttempts = attempts + 1;
        const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60000) : null;
        await pool.query(
          `UPDATE otp_attempts SET attempt_count = $1, last_attempt = CURRENT_TIMESTAMP, locked_until = $2 WHERE payment_id = $3`,
          [newAttempts, lockedUntil, id]
        );
      } else {
        await pool.query(
          `INSERT INTO otp_attempts (user_id, payment_id, attempt_count, last_attempt) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
          [req.userId, id, 1]
        );
      }
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP is valid, update payment
    const updateResult = await pool.query(
      `
      UPDATE manual_payments
      SET status = 'completed', otp_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, amount
      `,
      [id]
    );

    // Add coins to user
    await pool.query(
      `UPDATE users SET coins = coins + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [payment.amount, req.userId]
    );

    // Clear attempts
    await pool.query(`DELETE FROM otp_attempts WHERE payment_id = $1`, [id]);

    res.json({
      success: true,
      message: '🎉 Payment confirmed! Coins added to your account',
      coinsAdded: payment.amount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Get user's coins balance
router.get('/balance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT coins FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ coins: result.rows[0].coins });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Get user's payment history
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT id, amount, status, created_at, updated_at
      FROM manual_payments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
