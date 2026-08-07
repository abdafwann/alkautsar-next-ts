'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_cache } from 'next/cache';
import { uploadImage, deleteImage } from './upload';

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
    const title = formData.get('title') as string | null;
    
    // Upload image first
    const uploadRes = await uploadImage(formData);
    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: uploadRes.error || 'Gagal mengunggah banner.' };
    }

    const banner = await prisma.banner.create({
      data: {
        title: title || 'Banner Baru',
        publicId: uploadRes.data.public_id,
        url: uploadRes.data.secure_url,
        isActive: false // Default off
      }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Revalidate homepage too in case it was set to active immediately (though it's false here)
    return { success: true, data: banner };
  } catch (error: any) {
    return { success: false, error: 'Gagal menyimpan banner ke database.' };
  }
}

export async function toggleBanner(id: string, isActive: boolean) {
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: { isActive }
    });

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Home page
    return { success: true, data: banner };
  } catch (error: any) {
    return { success: false, error: 'Gagal mengubah status banner.' };
  }
}

export async function deleteBanner(id: string, publicId: string) {
  try {
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
    return { success: false, error: 'Gagal menghapus banner.' };
  }
}
