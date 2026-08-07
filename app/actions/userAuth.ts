'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession, getSession } from '@/lib/session';

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
      return { success: false, error: 'Semua kolom wajib diisi' };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
        email: email.toLowerCase(),
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
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email dan password wajib diisi' };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
