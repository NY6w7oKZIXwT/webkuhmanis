import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { paymentAPI } from '../utils/api';
import { OTPInput, OTPCountdown } from './OTPInput';
import { GlitchText, AnimatedText, StatusBadge } from './AnimatedElements';
import { playSound } from '../utils/sounds';

interface ConfirmPaymentProps {
  paymentId: string;
  onSuccess?: () => void;
}

export const ConfirmPaymentModal: React.FC<ConfirmPaymentProps> = ({ paymentId, onSuccess }) => {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { token } = useAuth();

  React.useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await paymentAPI.getPayment(paymentId);
        setPayment(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load payment');
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  const handleOTPComplete = async (otp: string) => {
    setVerifying(true);
    playSound('click');

    try {
      const response = await paymentAPI.verifyOTP(paymentId, otp);
      setSuccess(true);
      playSound('success');
      onSuccess?.();

      setTimeout(() => {
        // Close modal or redirect
      }, 2000);
    } catch (err: any) {
      playSound('error');
      setError(err.response?.data?.error || 'OTP verification failed');
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-900 border-2 border-blue-500 p-8 rounded-lg max-w-md">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-white text-center mt-4">Loading payment...</p>
        </div>
      </motion.div>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-slate-900 border-2 border-blue-500 p-8 rounded-lg max-w-md w-full mx-4 relative overflow-hidden"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
      >
        {/* Scanlines effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          white 2px,
          white 4px
        )" />

        {success ? (
          <>
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Confirmed!</h2>
              <p className="text-green-300 mb-4">+{payment.amount} coins added to your account</p>
            </motion.div>
          </>
        ) : (
          <>
            <motion.h2
              className="text-2xl font-bold text-blue-400 mb-6 text-center"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
            >
              🔐 Confirm Payment
            </motion.h2>

            <div className="space-y-4">
              <motion.div
                className="bg-slate-800 p-4 rounded border border-blue-500"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
              >
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="text-white text-2xl font-bold">${payment.amount}</p>
              </motion.div>

              <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
                <StatusBadge status={payment.status} label="Waiting OTP" />
              </motion.div>

              {payment.otp_expires_at && (
                <OTPCountdown
                  expiresAt={payment.otp_expires_at}
                  onExpired={() => setError('OTP has expired')}
                />
              )}

              <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
                <p className="text-gray-400 text-sm mb-3 text-center">
                  Enter the OTP code sent to you
                </p>
                <OTPInput onComplete={handleOTPComplete} isLoading={verifying} />
              </motion.div>

              {error && (
                <motion.div
                  className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              )}

              <p className="text-gray-500 text-xs text-center">
                Enter the 6-digit code provided by admin
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
