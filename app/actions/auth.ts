'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'alkautsar-super-secret-key-2026';
const key = new TextEncoder().encode(secretKey);

export async function loginAdmin(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'Email dan password harus diisi.' };
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return { error: 'Email tidak terdaftar sebagai admin.' };
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return { error: 'Password salah.' };
    }

    // Create session (JWT)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const token = await new SignJWT({ adminId: admin.id, email: admin.email, role: admin.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(key);

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires,
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Terjadi kesalahan pada server.' };
  }
}



export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
