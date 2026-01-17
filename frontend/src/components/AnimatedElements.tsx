import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {text}
    </motion.div>
  );
};

interface GlitchTextProps {
  text: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text }) => {
  return (
    <motion.div
      className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      animate={{
        textShadow: [
          '0 0 10px rgba(59, 130, 246, 0.5)',
          '0 0 20px rgba(168, 85, 247, 0.5)',
          '0 0 10px rgba(236, 72, 153, 0.5)',
          '0 0 20px rgba(59, 130, 246, 0.5)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {text}
    </motion.div>
  );
};

interface DigitalCounterProps {
  value: number;
}

export const DigitalCounter: React.FC<DigitalCounterProps> = ({ value }) => {
  return (
    <motion.div
      className="text-5xl font-black font-mono text-blue-500"
      key={value}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
    >
      {value.toString().padStart(2, '0')}
    </motion.div>
  );
};

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const colorMap = {
    pending: 'bg-yellow-900 text-yellow-200',
    approved: 'bg-blue-900 text-blue-200',
    completed: 'bg-green-900 text-green-200',
    rejected: 'bg-red-900 text-red-200',
  };

  const iconMap = {
    pending: '⏳',
    approved: '🔐',
    completed: '✅',
    rejected: '❌',
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${colorMap[status]}`}
      whileHover={{ scale: 1.05 }}
    >
      <span>{iconMap[status]}</span>
      <span>{label}</span>
    </motion.div>
  );
};

interface PulseCircleProps {
  size?: number;
}

export const PulseCircle: React.FC<PulseCircleProps> = ({ size = 100 }) => {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute rounded-full border-4 border-blue-500"
        style={{ width: size, height: size }}
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div
        className="rounded-full bg-blue-500"
        style={{ width: size * 0.4, height: size * 0.4 }}
      />
    </div>
  );
};

export const ScanlineOverlay: React.FC = () => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-5"
      animate={{ y: ['-100%', '100%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
  );
};
