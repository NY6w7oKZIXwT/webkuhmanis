import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { paymentAPI } from '../utils/api';
import { ConfirmPaymentModal } from '../components/ConfirmPayment';
import { GlitchText, AnimatedText } from '../components/AnimatedElements';
import { playSound } from '../utils/sounds';

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState<Payment[]>([]);
  const [amount, setAmount] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, historyRes] = await Promise.all([
          paymentAPI.getBalance(),
          paymentAPI.getHistory(),
        ]);
        setCoins(balanceRes.data.coins);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !proofImage) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);
    playSound('click');

    try {
      const response = await paymentAPI.uploadProof(parseFloat(amount), proofImage);
      playSound('success');
      alert('Payment proof submitted! Admin will verify soon.');
      setAmount('');
      setProofImage('');

      // Refresh history
      const historyRes = await paymentAPI.getHistory();
      setHistory(historyRes.data);
    } catch (error: any) {
      playSound('error');
      alert(error.response?.data?.error || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-900/30',
    approved: 'text-blue-400 bg-blue-900/30',
    completed: 'text-green-400 bg-green-900/30',
    rejected: 'text-red-400 bg-red-900/30',
  };

  const statusEmojis = {
    pending: '⏳',
    approved: '🔐',
    completed: '✅',
    rejected: '❌',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-8 relative overflow-hidden">
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
        >
          <div>
            <GlitchText text="💎 Your Balance" />
            <motion.div
              className="text-6xl font-black text-blue-400 mt-2"
              key={coins}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {coins.toFixed(2)} 🪙
            </motion.div>
          </div>
          <motion.button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Section */}
          <motion.section
            className="lg:col-span-2 border-2 border-blue-500 rounded-lg p-8 bg-slate-900/60 backdrop-blur"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
          >
            <h2 className="text-3xl font-bold text-blue-400 mb-6">📤 Upload Payment Proof</h2>

            <form onSubmit={handleSubmitPayment} className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-semibold mb-2 text-blue-300">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full bg-slate-800 border-2 border-blue-500 text-white px-4 py-3 rounded focus:outline-none focus:border-purple-500 text-xl"
                  placeholder="0.00"
                  disabled={submitting}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <label className="block text-sm font-semibold mb-2 text-blue-300">Transfer Proof (Screenshot)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-slate-800 border-2 border-blue-500 text-gray-400 px-4 py-3 rounded focus:outline-none"
                  disabled={submitting}
                />
              </motion.div>

              {proofImage && (
                <motion.img
                  src={proofImage}
                  alt="Preview"
                  className="w-full max-h-80 object-cover rounded border-2 border-blue-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}

              <motion.button
                type="submit"
                disabled={submitting || !amount || !proofImage}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 font-bold py-3 rounded text-lg transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? '⏳ Submitting...' : '🚀 Submit Payment'}
              </motion.button>
            </form>
          </motion.section>

          {/* Info Section */}
          <motion.section
            className="border-2 border-purple-500 rounded-lg p-8 bg-slate-900/60 backdrop-blur"
            initial={{ x: 50 }}
            animate={{ x: 0 }}
          >
            <h3 className="text-2xl font-bold text-purple-400 mb-4">📋 Process Flow</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">1️⃣</span>
                <span>Upload payment proof</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">2️⃣</span>
                <span>Admin verifies & approves</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">3️⃣</span>
                <span>Receive OTP code</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">4️⃣</span>
                <span>Enter OTP to confirm</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">5️⃣</span>
                <span>🎉 Coins added!</span>
              </div>
            </div>
          </motion.section>
        </div>

        {/* History Section */}
        <motion.section
          className="mt-8 border-2 border-green-500 rounded-lg p-8 bg-slate-900/60 backdrop-blur"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
        >
          <h3 className="text-3xl font-bold text-green-400 mb-6">📜 Payment History</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-500">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    className="border-b border-slate-700 hover:bg-slate-800 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-3 px-4">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-bold">${payment.amount}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-3 py-1 rounded-full ${statusColors[payment.status]} font-semibold`}>
                        {statusEmojis[payment.status]} {payment.status}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      {payment.status === 'approved' && (
                        <motion.button
                          onClick={() => setSelectedPaymentId(payment.id)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-bold"
                          whileHover={{ scale: 1.05 }}
                        >
                          🔐 Confirm OTP
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {history.length === 0 && (
            <p className="text-center text-gray-400 py-8">No payment history yet</p>
          )}
        </motion.section>
      </div>

      {/* OTP Confirmation Modal */}
      {selectedPaymentId && (
        <ConfirmPaymentModal
          paymentId={selectedPaymentId}
          onSuccess={() => {
            setSelectedPaymentId(null);
            // Refresh data
            const refreshData = async () => {
              const [balanceRes, historyRes] = await Promise.all([
                paymentAPI.getBalance(),
                paymentAPI.getHistory(),
              ]);
              setCoins(balanceRes.data.coins);
              setHistory(historyRes.data);
            };
            refreshData();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
