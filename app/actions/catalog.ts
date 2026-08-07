'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_cache } from 'next/cache';

// --- CATEGORY ACTIONS ---

export const getCategories = unstable_cache(
  async () => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });
      return { success: true, data: categories };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  ['categories-list'],
  { revalidate: 3600, tags: ['categories'] } // Cache selama 1 jam
);

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    
    if (!name || name.trim() === '') {
      return { success: false, error: 'Nama kategori harus diisi' };
    }

    const category = await prisma.category.create({
      data: { name: name.trim() }
    });

    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: 'Gagal membuat kategori' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id }
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Gagal menghapus kategori (pastikan tidak ada produk di dalam kategori ini)' };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    
    if (!name || name.trim() === '') {
      return { success: false, error: 'Nama kategori harus diisi' };
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });

    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: 'Gagal memperbarui kategori' };
  }
}

// --- PRODUCT ACTIONS ---

export async function getTotalProductsCount() {
  try {
    const count = await prisma.product.count();
    return { success: true, data: count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: true
      }
    });
    
    const serialized = products.map(p => ({
      ...p,
      price: Number(p.price),
      promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
    }));
    
    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true
      }
    });
    
    if (product) {
      const serialized = {
        ...product,
        price: Number(product.price),
        promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
      };
      return { success: true, data: serialized };
    }
    
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Gagal menghapus produk' };
  }
}

export async function saveProduct(id: string | null, data: any) {
  try {
    const { title, slug, uses, price, categoryId, productForm, composition, directions, warnings, certificate, quantity, images, isPromo, promoPercentage, promoPrice, promoExpiry } = data;

    // Validate slug uniqueness
    const existingSlug = await prisma.product.findFirst({
      where: { 
        slug,
        id: id ? { not: id } : undefined
      }
    });

    if (existingSlug) {
      return { success: false, error: 'Slug sudah digunakan oleh produk lain' };
    }

    const payload = {
      title,
      slug,
      uses,
      price: parseFloat(price),
      categoryId,
      productForm,
      composition,
      directions,
      warnings,
      certificate,
      quantity: parseInt(quantity),
      isPromo: isPromo === true || isPromo === 'true',
      promoPercentage: promoPercentage ? parseFloat(promoPercentage) : null,
      promoPrice: promoPrice ? parseFloat(promoPrice) : null,
      promoExpiry: promoExpiry ? new Date(promoExpiry) : null,
    };

    if (id) {
      // Update
      const product = await prisma.product.update({
        where: { id },
        data: payload
      });

      // Handle images (delete old ones and recreate for simplicity)
      if (images && images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productImage.createMany({
          data: images.map((img: any) => ({
            productId: id,
            publicId: img.publicId,
            url: img.url
          }))
        });
      }

      revalidatePath('/admin/products');
      const serialized = {
        ...product,
        price: Number(product.price),
        promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
      };
      return { success: true, data: serialized };
    } else {
      // Create
      const product = await prisma.product.create({
        data: {
          ...payload,
          images: {
            create: images ? images.map((img: any) => ({
              publicId: img.publicId,
              url: img.url
            })) : []
          }
        }
      });

      revalidatePath('/admin/products');
      const serialized = {
        ...product,
        price: Number(product.price),
        promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
      };
      return { success: true, data: serialized };
    }
  } catch (error: any) {
    console.error("Save Product Error:", error);
    return { success: false, error: `Gagal menyimpan produk: ${error.message || 'Unknown error'}` };
  }
}

export async function getShopProducts(filters?: {
  categoryId?: string;
  productForms?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  try {
    let whereClause: any = {};

    if (filters?.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters?.productForms && filters.productForms.length > 0) {
      whereClause.productForm = {
        in: filters.productForms
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        images: true
      }
    });

    const serialized = products.map(p => ({
      ...p,
      price: Number(p.price),
      promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
    }));
    
    // Filter harga di memory agar lebih mudah menangani price dan promoPrice
    let finalProducts = serialized;
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
       finalProducts = serialized.filter(p => {
         const effectivePrice = p.promoPrice || p.price;
         if (filters.minPrice !== undefined && effectivePrice < filters.minPrice) return false;
         if (filters.maxPrice !== undefined && effectivePrice > filters.maxPrice) return false;
         return true;
       });
    }

    // Sorting di memory agar bisa memperhitungkan effectivePrice
    if (filters?.sort === 'price_asc') {
      finalProducts.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
    } else if (filters?.sort === 'price_desc') {
      finalProducts.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
    } else {
      // Default: newest (sudah dari Prisma orderBy: createdAt: 'desc')
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 15; // 15 produk per halaman (3 baris x 5 produk)
    
    const totalPages = Math.ceil(finalProducts.length / limit);
    const paginatedProducts = finalProducts.slice((page - 1) * limit, page * limit);

    return { 
      success: true, 
      data: paginatedProducts,
      pagination: {
        totalProducts: finalProducts.length,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
