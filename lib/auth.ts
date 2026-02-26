import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = '7d';

export const COOKIE_NAME = 'fnf_token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
