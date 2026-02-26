import bcrypt from 'bcrypt';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { AppError } from '@/lib/errors';
import type { User } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

// ─── Internal DB row types ────────────────────────────────────────────────────

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

interface SafeUserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Public Service Functions ─────────────────────────────────────────────────

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const trimmedName = (name ?? '').trim();
  const normalizedEmail = (email ?? '').trim().toLowerCase();

  if (!trimmedName || trimmedName.length > 100) {
    throw new AppError('Name must be 1–100 characters', 422);
  }
  if (!isValidEmail(normalizedEmail)) {
    throw new AppError('Invalid email address', 422);
  }
  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 422);
  }

  const [existing] = await pool.execute<SafeUserRow[]>(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail],
  );
  if (existing.length > 0) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [trimmedName, normalizedEmail, passwordHash],
  );

  const [rows] = await pool.execute<SafeUserRow[]>(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
    [result.insertId],
  );

  return rows[0] as User;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const normalizedEmail = (email ?? '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new AppError('Email and password are required', 422);
  }

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = ?',
    [normalizedEmail],
  );

  const user = rows[0] ?? null;

  // Always run bcrypt.compare regardless of whether user exists.
  // Prevents timing-based email enumeration attacks.
  const hashToCompare = user?.password_hash ?? await bcrypt.hash('guard', BCRYPT_ROUNDS);
  const isMatch = await bcrypt.compare(password, hashToCompare).catch(() => false);

  if (!user || !isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const { password_hash: _, ...safeUser } = user;
  return safeUser as User;
}

export async function getUserById(id: number): Promise<User | null> {
  const [rows] = await pool.execute<SafeUserRow[]>(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
    [id],
  );
  return rows[0] ? (rows[0] as User) : null;
}
