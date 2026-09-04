'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { sanitizeString, isValidEmail } from '@/lib/validation';

// Mengambil StoreSettings (Singleton id: 'default')
export async function getStoreSettings() {
  try {
    let settings = await (prisma as any).storeSettings.findUnique({
      where: { id: 'default' }
    });

    // Jika belum ada (pertama kali aplikasi jalan), buat default
    if (!settings) {
      settings = await (prisma as any).storeSettings.create({
        data: {
          id: 'default',
          storeName: 'PT. Al-Kautsar',
        }
      });
    }

    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStoreSettings(data: {
  storeName: string;
  description?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  logoUrl?: string;
  logoPublicId?: string;
}) {
  try {
    await requireAdmin();

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Data pengaturan tidak valid' };
    }

    const cleanStoreName = sanitizeString(data.storeName).slice(0, 100);
    if (!cleanStoreName) {
      return { success: false, error: 'Nama toko wajib diisi' };
    }

    const cleanEmail = data.email ? data.email.toLowerCase().trim() : null;
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return { success: false, error: 'Format email toko tidak valid' };
    }

    const payload = {
      storeName: cleanStoreName,
      description: data.description ? sanitizeString(data.description).slice(0, 500) : null,
      email: cleanEmail,
      whatsapp: data.whatsapp ? sanitizeString(data.whatsapp).slice(0, 30) : null,
      address: data.address ? sanitizeString(data.address).slice(0, 500) : null,
      logoUrl: data.logoUrl ? sanitizeString(data.logoUrl) : null,
      logoPublicId: data.logoPublicId ? sanitizeString(data.logoPublicId) : null,
    };

    const settings = await (prisma as any).storeSettings.upsert({
      where: { id: 'default' },
      update: payload,
      create: {
        id: 'default',
        ...payload,
      }
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    
    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memperbarui pengaturan toko.' };
  }
}
