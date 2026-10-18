import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDatabase } from './db';
import { AdminProfile } from '@/types';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'deepaura_diwali_secure_session_secret_key_2026_festive_salt';
const SESSION_COOKIE_NAME = 'deepaura_admin_session';

export interface AdminSessionPayload {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
}

export async function verifyAdminCredentials(
  email: string,
  pass: string
): Promise<AdminProfile | null> {
  const db = getDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  const user = db.profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
  if (!user || user.role !== 'admin') {
    return null;
  }

  const hash = (user as any)._password_hash;
  if (!hash) {
    return null;
  }

  const matches = await bcrypt.compare(pass, hash);
  if (!matches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    created_at: user.created_at,
  };
}

export function createAdminToken(admin: AdminProfile): string {
  const payload: AdminSessionPayload = {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name,
    role: 'admin',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAdminToken(token: string): AdminSessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminSessionPayload;
    if (decoded && decoded.role === 'admin') {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAdminToken(token);
}

export { SESSION_COOKIE_NAME };
