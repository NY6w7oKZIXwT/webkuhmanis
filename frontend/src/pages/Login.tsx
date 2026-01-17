import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { GlitchText, AnimatedText } from '../components/AnimatedElements';
import { playSound } from '../utils/sounds';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    playSound('click');

    try {
      const response = await (isAdmin
        ? authAPI.adminLogin(password)
        : authAPI.login(email, password));

      const data = response.data;
      login(data.token, data.user.id, isAdmin ? 'admin' : 'user');
      playSound('success');
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="border-2 border-blue-500 rounded-lg p-8 backdrop-blur-md bg-slate-900/80">
          <motion.div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <GlitchText text="Payment OTP" />
            <p className="text-gray-400 mt-2">Konfirmasi Pembayaran</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-4">
            {!isAdmin && (
              <>
                <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
                  <label className="block text-sm font-semibold mb-2 text-blue-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:border-purple-500"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </motion.div>
              </>
            )}

            <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
              <label className="block text-sm font-semibold mb-2 text-blue-300">
                {isAdmin ? 'Admin Password' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border-2 border-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
                disabled={loading}
              />
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

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-bold py-2 rounded transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? '⏳ Logging in...' : '→ Login'}
            </motion.button>
          </form>

          <motion.button
            onClick={() => {
              setIsAdmin(!isAdmin);
              setError('');
            }}
            className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm"
            whileHover={{ scale: 1.05 }}
          >
            {isAdmin ? 'Back to User Login' : 'Admin Login'}
          </motion.button>

          {!isAdmin && (
            <motion.div
              className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded text-center text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Demo User:
              <br />
              Email: user@test.com
              <br />
              Password: test123
            </motion.div>
          )}

          {isAdmin && (
            <motion.div
              className="mt-6 p-4 bg-yellow-900/30 border border-yellow-500 rounded text-center text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Demo Admin:
              <br />
              Password: admin123
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
