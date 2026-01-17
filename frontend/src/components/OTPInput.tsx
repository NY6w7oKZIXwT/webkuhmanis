import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  isLoading?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, isLoading = false }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      playSound('beep');
    }

    // Check if all filled
    if (newOtp.every((digit) => digit !== '') && value) {
      playSound('click');
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <motion.input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          disabled={isLoading}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="w-12 h-12 text-center text-2xl font-bold border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 disabled:opacity-50 bg-slate-900 text-white"
        />
      ))}
    </div>
  );
};

interface CountdownProps {
  expiresAt: string;
  onExpired?: () => void;
}

export const OTPCountdown: React.FC<CountdownProps> = ({ expiresAt, onExpired }) => {
  const [remaining, setRemaining] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expireTime = new Date(expiresAt).getTime();
      const diff = expireTime - now;

      if (diff <= 0) {
        setRemaining(0);
        setExpired(true);
        onExpired?.();
        clearInterval(interval);
      } else {
        setRemaining(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <motion.div
      className={`text-center font-semibold ${expired ? 'text-red-500' : 'text-yellow-500'}`}
      animate={expired ? { scale: 1.1 } : {}}
    >
      {expired ? (
        <span>⏰ OTP Expired</span>
      ) : (
        <span>⏱️ {minutes}:{seconds.toString().padStart(2, '0')}</span>
      )}
    </motion.div>
  );
};
