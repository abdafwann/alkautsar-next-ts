'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_cache } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { recordAdminLog } from './admin-logs';
import { sanitizeString, validateProduct } from '@/lib/validation';

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
  { revalidate: 3600, tags: ['categories'] } // Cache for 1 hour
);

export async function createCategory(formData: FormData) {
  try {
    const admin = await requireAdmin();

    const rawName = formData.get('name') as string;
    const name = sanitizeString(rawName).slice(0, 100);
    
    if (!name || name.trim() === '') {
      return { success: false, error: 'Nama kategori harus diisi' };
    }

    const category = await prisma.category.create({
      data: { name: name.trim() }
    });

    await recordAdminLog({
      adminId: admin.adminId,
      action: 'CREATE_CATEGORY',
      entity: 'category',
      entityId: category.id,
      details: `Membuat kategori produk baru: ${category.name}`
    });

    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat kategori' };
  }
}

export async function deleteCategory(id: string) {
  try {
    const admin = await requireAdmin();

    const cat = await prisma.category.findUnique({ where: { id }, select: { name: true } });

    await prisma.category.delete({
      where: { id }
    });

    await recordAdminLog({
      adminId: admin.adminId,
      action: 'DELETE_CATEGORY',
      entity: 'category',
      entityId: id,
      details: `Menghapus kategori produk: ${cat?.name || id}`
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus kategori (pastikan tidak ada produk di dalam kategori ini)' };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const admin = await requireAdmin();

    const rawName = formData.get('name') as string;
    const name = sanitizeString(rawName).slice(0, 100);
    
    if (!name || name.trim() === '') {
      return { success: false, error: 'Nama kategori harus diisi' };
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });

    await recordAdminLog({
      adminId: admin.adminId,
      action: 'UPDATE_CATEGORY',
      entity: 'category',
      entityId: category.id,
      details: `Mengubah nama kategori menjadi: ${category.name}`
    });

    revalidatePath('/admin/categories');
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memperbarui kategori' };
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
      promoExpiry: p.promoExpiry?.toISOString() ?? null,
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
        promoExpiry: product.promoExpiry?.toISOString() ?? null,
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
    const admin = await requireAdmin();

    const product = await prisma.product.findUnique({ where: { id }, select: { title: true } });

    await prisma.product.delete({
      where: { id }
    });

    await recordAdminLog({
      adminId: admin.adminId,
      action: 'DELETE_PRODUCT',
      entity: 'product',
      entityId: id,
      details: `Menghapus produk: ${product?.title || id}`
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus produk' };
  }
}

export async function saveProduct(id: string | null, data: any) {
  try {
    const admin = await requireAdmin();

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Data produk tidak valid' };
    }

    const { images } = data;

    const sanitizedInput = {
      title: sanitizeString(data.title).slice(0, 200),
      slug: sanitizeString(data.slug).toLowerCase().trim().slice(0, 200),
      uses: sanitizeString(data.uses).slice(0, 2000),
      price: typeof data.price === 'string' ? parseFloat(data.price) : Number(data.price),
      categoryId: sanitizeString(data.categoryId),
      productForm: sanitizeString(data.productForm).slice(0, 50),
      composition: data.composition ? sanitizeString(data.composition).slice(0, 2000) : '',
      directions: sanitizeString(data.directions).slice(0, 1000),
      warnings: data.warnings ? sanitizeString(data.warnings).slice(0, 1000) : '',
      certificate: sanitizeString(data.certificate).slice(0, 100),
      quantity: typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : Number(data.quantity),
      isPromo: data.isPromo === true || data.isPromo === 'true',
      promoPercentage: data.promoPercentage !== undefined && data.promoPercentage !== null && data.promoPercentage !== '' ? parseFloat(String(data.promoPercentage)) : null,
      promoPrice: data.promoPrice !== undefined && data.promoPrice !== null && data.promoPrice !== '' ? parseFloat(String(data.promoPrice)) : null,
      promoExpiry: data.promoExpiry ? String(data.promoExpiry) : null,
    };

    const validation = validateProduct(sanitizedInput);
    if (!validation.success) {
      const errorMsg = Object.values(validation.errors).join(', ');
      return { success: false, error: `Validasi gagal: ${errorMsg}` };
    }

    const validData = validation.data;

    // Validate slug uniqueness
    const existingSlug = await prisma.product.findFirst({
      where: { 
        slug: validData.slug,
        id: id ? { not: id } : undefined
      }
    });

    if (existingSlug) {
      return { success: false, error: 'Slug sudah digunakan oleh produk lain' };
    }

    const payload = {
      title: validData.title,
      slug: validData.slug,
      uses: validData.uses,
      price: validData.price,
      categoryId: validData.categoryId,
      productForm: validData.productForm,
      composition: validData.composition || null,
      directions: validData.directions,
      warnings: validData.warnings || null,
      certificate: validData.certificate,
      quantity: validData.quantity,
      isPromo: validData.isPromo,
      promoPercentage: validData.promoPercentage ?? null,
      promoPrice: validData.promoPrice ?? null,
      promoExpiry: validData.promoExpiry ? new Date(validData.promoExpiry) : null,
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

      await recordAdminLog({
        adminId: admin.adminId,
        action: 'UPDATE_PRODUCT',
        entity: 'product',
        entityId: id,
        details: `Memperbarui data produk: ${product.title} (Harga: Rp ${Number(product.price).toLocaleString('id-ID')}, Stok: ${product.quantity})`
      });

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

      await recordAdminLog({
        adminId: admin.adminId,
        action: 'CREATE_PRODUCT',
        entity: 'product',
        entityId: product.id,
        details: `Menambah produk baru: ${product.title} (Stok: ${product.quantity}, Harga: Rp ${Number(product.price).toLocaleString('id-ID')})`
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
    return { success: false, error: error.message || 'Gagal menyimpan produk' };
  }
}

export async function updateStock(id: string, quantity: number) {
  try {
    const admin = await requireAdmin();

    const product = await prisma.product.update({
      where: { id },
      data: {
        quantity: {
          increment: quantity
        }
      }
    });

    await recordAdminLog({
      adminId: admin.adminId,
      action: 'UPDATE_STOCK',
      entity: 'product',
      entityId: id,
      details: `Menambah stok produk ${product.title}: +${quantity} (Total stok baru: ${product.quantity})`
    });

    revalidatePath('/admin/products');
    return { success: true, data: { newQuantity: product.quantity } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memperbarui stok' };
  }
}

export async function updatePromo(id: string, promoData: {
  isPromo: boolean;
  promoPercentage: number | null;
  promoPrice: number | null;
  promoExpiry: string | null;
}) {
  try {
    const admin = await requireAdmin();

    const product = await prisma.product.update({
      where: { id },
      data: {
        isPromo: promoData.isPromo,
        promoPercentage: promoData.promoPercentage,
        promoPrice: promoData.promoPrice,
        promoExpiry: promoData.promoExpiry ? new Date(promoData.promoExpiry) : null,
      }
    });

    await recordAdminLog({
      adminId: admin.adminId,
      action: 'UPDATE_PROMO',
      entity: 'product',
      entityId: id,
      details: `Mengatur promo ${product.title}: ${promoData.isPromo ? `Aktif (${promoData.promoPercentage}% / Rp ${promoData.promoPrice})` : 'Dinonaktifkan'}`
    });

    revalidatePath('/admin/products');
    return {
      success: true,
      data: {
        isPromo: product.isPromo,
        promoPercentage: product.promoPercentage,
        promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
        promoExpiry: product.promoExpiry?.toISOString() || null,
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memperbarui promo' };
  }
}

export async function getProductsByCategory(categoryId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId },
      include: {
        images: true
      },
      orderBy: { title: 'asc' }
    });

    const serialized = products.map(p => ({
      ...p,
      price: Number(p.price),
      promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
      promoExpiry: p.promoExpiry?.toISOString() ?? null,
    }));

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: 'Gagal mengambil produk' };
  }
}

export async function getShopProducts(filters?: {
  query?: string;
  categoryId?: string;
  productForms?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  try {
    let whereClause: any = {};

    if (filters?.inStock) {
      whereClause.quantity = { gt: 0 };
    }

    if (filters?.query) {
      const cleanQuery = typeof filters.query === 'string' ? sanitizeString(filters.query).slice(0, 100).trim() : '';
      if (cleanQuery) {
        whereClause.OR = [
          { title: { contains: cleanQuery, mode: 'insensitive' } },
          { uses: { contains: cleanQuery, mode: 'insensitive' } },
          { slug: { contains: cleanQuery, mode: 'insensitive' } },
        ];
      }
    }

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

// --- SEARCH ACTIONS ---

export async function searchProductsLive(query: string) {
  try {
    const cleanQuery = typeof query === 'string' ? sanitizeString(query).slice(0, 100).trim() : '';

    if (!cleanQuery || cleanQuery.length < 2) {
      return { success: true, data: [] };
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: cleanQuery, mode: 'insensitive' } },
          { slug: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
        images: true,
      },
      take: 5, // Limit to 5 results for dropdown
      orderBy: { createdAt: 'desc' },
    });

    const serialized = products.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: Number(p.price),
      promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
      images: p.images.map(img => ({ url: img.url })),
      category: p.category ? { name: p.category.name } : null,
    }));

    return { success: true, data: serialized };
  } catch (error: any) {
    console.error('Search error:', error);
    return { success: false, error: error.message };
  }
}
