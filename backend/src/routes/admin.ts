import { Router, Request, Response } from 'express';
import pool from '../db/connection.js';
import { generateOTP, hashOTP } from '../utils/otp.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Admin: Get all pending payments
router.get('/admin/payments', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.user_id, 
        u.username, 
        p.amount, 
        p.status, 
        p.otp_code,
        p.otp_expires_at,
        p.created_at,
        p.proof_image
      FROM manual_payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.status IN ('pending', 'approved')
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Admin: Approve payment and generate OTP
router.post('/admin/payments/:id/approve', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '15') * 60000));

    const result = await pool.query(
      `
      UPDATE manual_payments
      SET status = 'approved', otp_code = $1, otp_expires_at = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, user_id, otp_code, otp_expires_at
      `,
      [otpHash, expiresAt, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_id, details) VALUES ($1, $2, $3, $4)',
      [req.userId, 'approve_payment', id, JSON.stringify({ notes })]
    );

    res.json({ 
      success: true, 
      message: 'Payment approved, OTP generated',
      paymentId: result.rows[0].id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// Admin: Regenerate OTP
router.post('/admin/payments/:id/regenerate-otp', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const otp = generateOTP(6);
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '15') * 60000));

    const result = await pool.query(
      `
      UPDATE manual_payments
      SET otp_code = $1, otp_expires_at = $2, otp_used_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND status = 'approved'
      RETURNING id
      `,
      [otpHash, expiresAt, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found or not in approved status' });
    }

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_id) VALUES ($1, $2, $3)',
      [req.userId, 'regenerate_otp', id]
    );

    res.json({ success: true, message: 'OTP regenerated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to regenerate OTP' });
  }
});

// Admin: Reject/Cancel payment
router.post('/admin/payments/:id/reject', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE manual_payments
      SET status = 'rejected', notes = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status IN ('pending', 'approved')
      RETURNING id
      `,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_id, details) VALUES ($1, $2, $3, $4)',
      [req.userId, 'reject_payment', id, JSON.stringify({ reason })]
    );

    res.json({ success: true, message: 'Payment rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

export default router;
