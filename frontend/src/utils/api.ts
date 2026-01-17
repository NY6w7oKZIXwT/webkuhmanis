import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  adminLogin: (password: string) =>
    api.post('/auth/admin-login', { password }),
};

export const paymentAPI = {
  uploadProof: (amount: number, proof_image: string) =>
    api.post('/payments/upload', { amount, proof_image }),
  getPayment: (id: string) =>
    api.get(`/payments/${id}`),
  verifyOTP: (id: string, otp: string) =>
    api.post(`/payments/${id}/verify-otp`, { otp }),
  getBalance: () =>
    api.get('/payments/balance'),
  getHistory: () =>
    api.get('/payments/history'),
};

export const adminAPI = {
  getPayments: () =>
    api.get('/admin/payments'),
  approvePayment: (id: string, notes?: string) =>
    api.post(`/admin/payments/${id}/approve`, { notes }),
  regenerateOTP: (id: string) =>
    api.post(`/admin/payments/${id}/regenerate-otp`),
  rejectPayment: (id: string, reason?: string) =>
    api.post(`/admin/payments/${id}/reject`, { reason }),
};

export default api;
