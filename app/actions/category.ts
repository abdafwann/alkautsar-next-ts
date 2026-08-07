'use server';

import { prisma } from '@/lib/prisma';

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return { success: true, data: categories };
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Gagal memuat kategori' };
  }
}
