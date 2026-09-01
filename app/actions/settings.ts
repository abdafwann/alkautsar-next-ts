'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';

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

    const payload = {
      storeName: data.storeName,
      description: data.description || null,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      logoUrl: data.logoUrl || null,
      logoPublicId: data.logoPublicId || null,
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
