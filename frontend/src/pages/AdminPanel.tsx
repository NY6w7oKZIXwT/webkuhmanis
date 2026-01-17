import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../utils/api';
import { playSound } from '../utils/sounds';

interface AdminPayment {
  id: string;
  user_id: string;
  username: string;
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  created_at: string;
  otp_expires_at?: string;
  proof_image?: string;
}

export const AdminPanel: React.FC = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await adminAPI.getPayments();
        setPayments(response.data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchPayments, 5000); // Auto-refresh every 5s
    fetchPayments();

    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (paymentId: string) => {
    try {
      await adminAPI.approvePayment(paymentId, 'Payment approved by admin');
      playSound('success');
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: 'approved' } : p))
      );
    } catch (error: any) {
      playSound('error');
      alert(error.response?.data?.error || 'Approval failed');
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await adminAPI.rejectPayment(paymentId, rejectionReason);
      playSound('error');
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: 'rejected' } : p))
      );
      setSelectedPayment(null);
      setRejectionReason('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Rejection failed');
    }
  };

  const handleRegenerateOTP = async (paymentId: string) => {
    try {
      await adminAPI.regenerateOTP(paymentId);
      playSound('click');
      alert('OTP regenerated successfully');
    } catch (error: any) {
      playSound('error');
      alert(error.response?.data?.error || 'Regeneration failed');
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const approvedPayments = payments.filter((p) => p.status === 'approved');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-blue-400"
        initial={{ y: -30 }}
        animate={{ y: 0 }}
      >
        👨‍💼 Admin Panel - Payment OTP Manager
      </motion.h1>

      {loading ? (
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pending Payments */}
          <motion.section
            className="border-2 border-yellow-500 rounded-lg p-6 bg-slate-900"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              ⏳ Pending ({pendingPayments.length})
            </h2>
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  className="border border-yellow-500 rounded p-4 hover:bg-slate-800 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-blue-300">{payment.username}</p>
                      <p className="text-2xl font-bold text-white">${payment.amount}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  {payment.proof_image && (
                    <img
                      src={payment.proof_image}
                      alt="Proof"
                      className="w-full h-32 object-cover rounded mb-3 border border-blue-500"
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(payment.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => setSelectedPayment(payment.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </motion.div>
              ))}
              {pendingPayments.length === 0 && (
                <p className="text-gray-400 text-center py-8">No pending payments</p>
              )}
            </div>
          </motion.section>

          {/* Approved Payments (Waiting OTP Verification) */}
          <motion.section
            className="border-2 border-blue-500 rounded-lg p-6 bg-slate-900"
            initial={{ x: 50 }}
            animate={{ x: 0 }}
          >
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              🔐 Approved ({approvedPayments.length})
            </h2>
            <div className="space-y-4">
              {approvedPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  className="border border-blue-500 rounded p-4 hover:bg-slate-800"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-blue-300">{payment.username}</p>
                      <p className="text-2xl font-bold text-white">${payment.amount}</p>
                    </div>
                  </div>

                  <div className="bg-slate-800 p-3 rounded mb-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">OTP Expires:</p>
                    <p className="text-lg font-mono text-blue-400">
                      {payment.otp_expires_at
                        ? new Date(payment.otp_expires_at).toLocaleTimeString()
                        : 'N/A'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRegenerateOTP(payment.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold"
                  >
                    🔄 Regenerate OTP
                  </button>
                </motion.div>
              ))}
              {approvedPayments.length === 0 && (
                <p className="text-gray-400 text-center py-8">No approved payments</p>
              )}
            </div>
          </motion.section>
        </div>
      )}

      {/* Rejection Dialog */}
      {selectedPayment && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-slate-900 border-2 border-red-500 p-6 rounded-lg max-w-sm"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-xl font-bold text-red-400 mb-4">Reject Payment</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full bg-slate-800 border border-red-500 text-white p-3 rounded mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleReject(selectedPayment);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
