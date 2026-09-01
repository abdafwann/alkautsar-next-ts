'use server';

import { prisma } from '@/lib/prisma';

export async function getActiveBanner() {
  try {
    const banner = await (prisma as any).banner.findFirst({
      where: { isActive: true }
    });
    
    // Default fallback banner if none is active
    if (!banner || !banner.url) {
      return {
        success: true,
        data: {
          bannerUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600&auto=format&fit=crop&q=80",
          storeName: "Al-Kautsar Herbal"
        }
      };
    }
    // We still need store settings for the store name
    const settings = await (prisma as any).storeSettings.findUnique({ where: { id: 'default' } });
    
    return { 
      success: true, 
      data: {
        bannerUrl: banner.url,
        storeName: settings?.storeName || 'Alkautsar Herbal'
      } 
    };
  } catch (error) {
    console.error("Error fetching banner:", error);
    return { success: false, error: 'Gagal mengambil banner' };
  }
}

export async function getFeaturedCategories(limit = 6) {
  try {
    const categories = await prisma.category.findMany({
      take: limit
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: 'Gagal mengambil kategori' };
  }
}
