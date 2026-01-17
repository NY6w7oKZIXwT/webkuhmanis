import React, { createContext, useState, useCallback } from 'react';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: string | null;
  login: (token: string, userId: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const login = useCallback((token: string, userId: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    setToken(token);
    setUserId(userId);
    setRole(role);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setToken(null);
    setUserId(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userId, role, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
