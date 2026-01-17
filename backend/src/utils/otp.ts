import crypto from 'crypto';

export const generateOTP = (length: number = 6): string => {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return otp;
};

export const hashOTP = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

export const verifyOTP = (inputOTP: string, hashedOTP: string): boolean => {
  const inputHash = crypto.createHash('sha256').update(inputOTP).digest('hex');
  return inputHash === hashedOTP;
};
