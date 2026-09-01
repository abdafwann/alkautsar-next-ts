'use server';

import { prisma, runWithRlsContext } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export interface UserProfileData {
  name: string;
  email: string;
  mobile: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  postalCode: string | null;
}

export type ProfileResponse =
  | { success: true; data: UserProfileData; error?: never }
  | { success: false; error: string; data?: never };

export type ActionResponse =
  | { success: true; error?: never }
  | { success: false; error: string };

export async function getProfile(): Promise<ProfileResponse> {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    return await runWithRlsContext({ userId: session.userId, isAdmin: false }, async () => {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          name: true,
          email: true,
          mobile: true,
          address: true,
          province: true,
          city: true,
          postalCode: true,
        }
      });

      if (!user) return { success: false, error: 'User tidak ditemukan' };
      return { success: true, data: user };
    });
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    return { success: false, error: error.message || 'Gagal memuat profil' };
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;
    const province = formData.get('province') as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postalCode') as string;

    if (!name) {
      return { success: false, error: 'Nama wajib diisi' };
    }

    return await runWithRlsContext({ userId: session.userId, isAdmin: false }, async () => {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          name,
          mobile,
          address,
          province,
          city,
          postalCode
        }
      });

      revalidatePath('/account');
      return { success: true };
    });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return { success: false, error: error.message || 'Gagal memperbarui profil' };
  }
}

export async function changePassword(formData: FormData): Promise<ActionResponse> {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const oldPassword = formData.get('oldPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { success: false, error: 'Semua kolom kata sandi wajib diisi' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Kata sandi baru tidak cocok' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Kata sandi minimal harus terdiri dari 8 karakter' };
    }
    if (!/[A-Z]/.test(newPassword)) {
      return { success: false, error: 'Kata sandi harus mengandung minimal 1 huruf kapital (A-Z)' };
    }
    if (!/[0-9]/.test(newPassword)) {
      return { success: false, error: 'Kata sandi harus mengandung minimal 1 angka (0-9)' };
    }

    return await runWithRlsContext({ userId: session.userId, isAdmin: false }, async () => {
      const user = await prisma.user.findUnique({
        where: { id: session.userId }
      });

      if (!user) {
        return { success: false, error: 'User tidak ditemukan' };
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return { success: false, error: 'Kata sandi lama salah' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: session.userId },
        data: { password: hashedPassword, passwordChangedAt: new Date() }
      });

      return { success: true };
    });
  } catch (error: any) {
    console.error('Change Password Error:', error);
    return { success: false, error: error.message || 'Gagal mengubah kata sandi' };
  }
}
