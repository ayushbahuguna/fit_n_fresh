/**
 * Server-side session utilities. Node.js runtime only — do NOT import in proxy.ts
 * or any module that runs on the Edge Runtime.
 */
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import type { JWTPayload } from '@/lib/auth';

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) throw new AppError('Unauthorized', 401);
  return session;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) throw new AppError('Unauthorized', 401);
  if (session.role !== 'admin') throw new AppError('Forbidden', 403);
  return session;
}
