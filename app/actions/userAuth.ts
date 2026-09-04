'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession, getSession } from '@/lib/session';
import { sanitizeString, isValidEmail } from '@/lib/validation';

export async function registerUser(formData: FormData) {
  try {
    const rawName = formData.get('name') as string;
    const rawEmail = formData.get('email') as string;
    const password = formData.get('password') as string;

    const name = sanitizeString(rawName).slice(0, 100);
    const email = typeof rawEmail === 'string' ? rawEmail.toLowerCase().trim() : '';

    if (!name || !email || !password) {
      return { success: false, error: 'Semua kolom wajib diisi' };
    }

    if (!isValidEmail(email)) {
      return { success: false, error: 'Format alamat email tidak valid' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Kata sandi minimal 6 karakter' };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar', reason: 'EXISTS' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    return { success: true, data: user };
  } catch (error: any) {
    console.error("Register Error:", error);
    return { success: false, error: 'Terjadi kesalahan saat mendaftar' };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const rawEmail = formData.get('email') as string;
    const password = formData.get('password') as string;
    const email = typeof rawEmail === 'string' ? rawEmail.toLowerCase().trim() : '';

    if (!email || !password) {
      return { success: false, error: 'Email dan password wajib diisi' };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Email atau kata sandi salah' };
    }

    // Check if blocked
    if (user.isBlocked) {
      return { success: false, error: 'Akun Anda telah diblokir. Silakan hubungi admin.' };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: 'Email atau kata sandi salah' };
    }

    // Set cookie session
    await createSession(user.id, user.name, user.email);
    
    return { 
      success: true, 
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    };
  } catch (error: any) {
    console.error("Login Error:", error);
    return { success: false, error: 'Terjadi kesalahan saat login' };
  }
}

export async function logoutUser() {
  await deleteSession();
  return { success: true };
}

export async function getAuthSession() {
  const session = await getSession();
  if (session) {
    return {
      id: session.userId as string,
      name: session.name as string,
      email: session.email as string,
    };
  }
  return null;
}
