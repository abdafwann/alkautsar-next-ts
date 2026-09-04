'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_cache } from 'next/cache';
import { uploadImage, deleteImage } from './upload';
import { requireAdmin } from '@/lib/auth-guard';
import { sanitizeString } from '@/lib/validation';

export const getBanners = unstable_cache(
  async () => {
    try {
      const banners = await prisma.banner.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, data: banners };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  ['all-banners'],
  { revalidate: 3600, tags: ['banners'] }
);

export const getActiveBanners = unstable_cache(
  async () => {
    try {
      const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      return { success: true, data: banners };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  ['active-banners'],
  { revalidate: 3600, tags: ['banners'] }
);

export async function uploadBannerData(formData: FormData) {
  try {
    await requireAdmin();

    const rawTitle = formData.get('title') as string | null;
    const cleanTitle = rawTitle ? sanitizeString(rawTitle).slice(0, 100) : 'Banner Baru';
    
    // Upload image first
    const uploadRes = await uploadImage(formData);
    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: uploadRes.error || 'Gagal mengunggah banner.' };
    }

    const banner = await prisma.banner.create({
      data: {
        title: cleanTitle || 'Banner Baru',
        publicId: uploadRes.data.publicId,
        url: uploadRes.data.url,
        isActive: false // Default off
      }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Revalidate homepage too
    return { success: true, data: banner };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menyimpan banner ke database.' };
  }
}

export async function toggleBanner(id: string, isActive: boolean) {
  try {
    await requireAdmin();

    const banner = await prisma.banner.update({
      where: { id },
      data: { isActive }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Home page
    return { success: true, data: banner };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah status banner.' };
  }
}

export async function deleteBanner(id: string, publicId: string) {
  try {
    await requireAdmin();

    // Hapus dari Cloudinary
    await deleteImage(publicId);

    // Hapus dari Database
    await prisma.banner.delete({
      where: { id }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus banner.' };
  }
}
