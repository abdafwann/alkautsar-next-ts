'use server';

import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { checkRateLimit } from '@/lib/rateLimitWrapper';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production');
    }
    return new TextEncoder().encode('development-fallback-secret-key-32-chars-long');
  }
  return new TextEncoder().encode(secret);
}

export async function loginAdmin(_prevState: any, formData: FormData) {
  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() || headerList.get('x-real-ip') || '127.0.0.1';

    // Rate limiting: max 5 attempts per 10 minutes per IP (Brute-force protection)
    const rateLimit = await checkRateLimit(ip, 'auth');
    if (!rateLimit.isAllowed) {
      return { 
        success: false, 
        error: 'Terlalu banyak percobaan login gagal. Harap tunggu beberapa menit sebelum mencoba kembali.' 
      };
    }

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email dan password harus diisi.' };
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      return { success: false, error: 'Email atau password salah.' };
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return { success: false, error: 'Email atau password salah.' };
    }

    // Create session (JWT)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const token = await new SignJWT({ adminId: admin.id, email: admin.email, role: admin.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret());

    // Set secure HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires,
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server saat login.' };
  }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
