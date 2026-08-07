'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_cache } from 'next/cache';

// Mengambil StoreSettings (Karena singleton, kita ambil yang id-nya 'default')
// Menggunakan cache agar tidak membebani database setiap kali navbar/footer di-render
export const getStoreSettings = unstable_cache(
  async () => {
    try {
      let settings = await prisma.storeSettings.findUnique({
        where: { id: 'default' }
      });

      // Jika belum ada (pertama kali aplikasi jalan), buat default
      if (!settings) {
        settings = await prisma.storeSettings.create({
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
  },
  ['store-settings'],
  { revalidate: 3600, tags: ['settings'] }
);

export async function updateStoreSettings(data: {
  storeName: string;
  email?: string;
  whatsapp?: string;
  logoUrl?: string;
  logoPublicId?: string;
}) {
  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: {
        id: 'default',
        ...data
      }
    });

    revalidatePath('/', 'layout'); // Revalidate semua route agar logo/nama baru ter-apply
    revalidatePath('/admin/settings');
    
    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: 'Gagal memperbarui pengaturan toko.' };
  }
}
