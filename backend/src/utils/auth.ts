import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string = 'user'): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};
