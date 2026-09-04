'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redis } from '@/lib/redis';
import { sanitizeString } from '@/lib/validation';

const CART_CACHE_TTL = 300; // 5 minutes

async function getCachedCart(userId: string) {
  try {
    const cacheKey = `cart:${userId}`;
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Fail-open: proceed to database if Redis cache is unavailable
    return null;
  }
  return null;
}

async function setCartCache(userId: string, data: any) {
  try {
    const cacheKey = `cart:${userId}`;
    await redis.set(cacheKey, JSON.stringify(data), { ex: CART_CACHE_TTL });
  } catch {
    // Non-blocking: failure to cache should not fail the user's cart operation
  }
}

async function invalidateCartCache(userId: string) {
  try {
    const cacheKey = `cart:${userId}`;
    await redis.del(cacheKey);
  } catch {
    // Non-blocking
  }
}

/**
 * Fetch database cart for authenticated members.
 * Non-member guests gracefully return an empty array without raising auth errors.
 */
export async function getDbCart() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: true, guest: true, data: [] };
    }

    const userId = session.userId as string;

    const cached = await getCachedCart(userId);
    if (cached) {
      return { success: true, data: cached, cached: true };
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true
          }
        }
      }
    });

    const formattedCart = cartItems.map(item => ({
      id: item.productId,
      title: item.product.title,
      price: Number(item.product.promoPrice || item.product.price),
      originalPrice: item.product.promoPrice ? Number(item.product.price) : undefined,
      discountPercentage: item.product.promoPercentage ?? undefined,
      imageUrl: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : 'https://placehold.co/400x400?text=No+Image',
      slug: item.product.slug,
      quantity: item.quantity
    }));

    await setCartCache(userId, formattedCart);
    return { success: true, data: formattedCart };
  } catch (error: any) {
    console.error("Get DB Cart Error:", error);
    return { success: false, error: error.message || 'Gagal memuat keranjang' };
  }
}

export async function addToDbCart(productId: string, quantity: number = 1) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: true, guest: true };
    }
    const userId = session.userId as string;

    // Validasi stok produk di database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { quantity: true, title: true }
    });

    if (!product || product.quantity <= 0) {
      return { success: false, error: 'Stok produk habis atau tidak tersedia' };
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + quantity > product.quantity) {
      return { 
        success: false, 
        error: `Stok tidak mencukupi permintaan Anda (tersedia: ${product.quantity} item)` 
      };
    }

    const safeQuantity = Math.min(product.quantity, currentQty + quantity);

    await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      update: {
        quantity: safeQuantity
      },
      create: {
        userId,
        productId,
        quantity: safeQuantity
      }
    });

    await invalidateCartCache(userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menambahkan ke keranjang' };
  }
}

export async function updateDbCartItem(productId: string, quantity: number) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: true, guest: true };
    }
    const userId = session.userId as string;

    if (quantity <= 0) {
      return removeFromDbCart(productId);
    }

    // Validasi keberadaan dan ketersediaan stok produk di database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { quantity: true, title: true }
    });

    if (!product) {
      return { success: false, error: 'Produk tidak ditemukan di database' };
    }

    if (product.quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { userId, productId }
      });
      await invalidateCartCache(userId);
      return { success: false, error: 'Stok produk ini sedang habis' };
    }

    const safeQuantity = Math.min(product.quantity, Math.max(1, Math.floor(quantity)));

    // Menggunakan upsert agar tidak melempar error "Record to update not found" (P2025)
    // apabila item keranjang sebelumnya baru tersimpan di memori browser/local storage
    await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      update: {
        quantity: safeQuantity
      },
      create: {
        userId,
        productId,
        quantity: safeQuantity
      }
    });

    await invalidateCartCache(userId);
    return { success: true, quantity: safeQuantity };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memperbarui jumlah produk' };
  }
}

export async function removeFromDbCart(productId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: true, guest: true };
    }
    const userId = session.userId as string;

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId
      }
    });

    await invalidateCartCache(userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus produk dari keranjang' };
  }
}

export async function clearDbCart() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: true, guest: true };
    }
    const userId = session.userId as string;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    await invalidateCartCache(userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengosongkan keranjang' };
  }
}

/**
 * Merges local guest cart items into member DB cart upon successful login.
 * Validates product IDs against the database to prevent foreign key integrity violations.
 */
export async function mergeGuestCart(guestItems: any[]) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Not authenticated' };
    const userId = session.userId as string;

    if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) return { success: true };

    const guestProductIds = guestItems
      .map(i => (typeof i?.id === 'string' ? sanitizeString(i.id).trim() : ''))
      .filter(Boolean);
    if (guestProductIds.length === 0) return { success: true };

    // Validate that products actually exist in database
    const validProducts = await prisma.product.findMany({
      where: { id: { in: guestProductIds } },
      select: { id: true }
    });
    const validProductMap = new Set(validProducts.map(p => p.id));

    // Get current DB cart
    const dbCart = await prisma.cartItem.findMany({
      where: { userId }
    });
    const dbCartMap = new Map(dbCart.map(item => [item.productId, item]));

    // Commit valid guest items to database
    for (const item of guestItems) {
      if (!item || !item.id || !validProductMap.has(item.id)) continue;

      const safeQuantity = Math.min(999, Math.max(1, Math.floor(Number(item.quantity)) || 1));

      const existing = dbCartMap.get(item.id);
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.min(999, existing.quantity + safeQuantity) }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId: item.id,
            quantity: safeQuantity
          }
        });
      }
    }

    await invalidateCartCache(userId);
    return { success: true };
  } catch (error: any) {
    console.error("Merge Cart Error:", error);
    return { success: false, error: error.message || 'Gagal menggabungkan keranjang' };
  }
}

export interface CartStockItemValidation {
  id: string;
  title: string;
  requestedQty: number;
  availableStock: number;
  isAvailable: boolean;
  hasExceeded: boolean;
  maxAllowedQty: number;
}

export interface CartStockValidationResult {
  success: boolean;
  isValid: boolean;
  items: CartStockItemValidation[];
  errorMessage?: string;
}

/**
 * Validates real-time inventory stock for all products currently in cart.
 * Prevents checkout navigation and submission if requested quantity exceeds available stock.
 */
export async function validateCartStock(
  items: { id: string; quantity: number }[]
): Promise<CartStockValidationResult> {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: true, isValid: true, items: [] };
    }

    const cleanItems = items
      .map(i => ({
        id: typeof i?.id === 'string' ? sanitizeString(i.id).trim() : '',
        quantity: Math.max(1, Math.floor(Number(i?.quantity)) || 1)
      }))
      .filter(i => i.id !== '');

    if (cleanItems.length === 0) {
      return { success: true, isValid: true, items: [] };
    }

    const productIds = cleanItems.map(i => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        quantity: true,
      }
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    let isValid = true;
    const errors: string[] = [];

    const validatedItems: CartStockItemValidation[] = cleanItems.map(item => {
      const p = productMap.get(item.id);
      if (!p) {
        isValid = false;
        errors.push(`Produk sudah tidak tersedia.`);
        return {
          id: item.id,
          title: 'Produk Tidak Ditemukan',
          requestedQty: item.quantity,
          availableStock: 0,
          isAvailable: false,
          hasExceeded: true,
          maxAllowedQty: 0,
        };
      }

      const availableStock = Math.max(0, p.quantity);
      const hasExceeded = item.quantity > availableStock;
      if (hasExceeded) {
        isValid = false;
        if (availableStock === 0) {
          errors.push(`Stok produk "${p.title}" saat ini sedang habis.`);
        } else {
          errors.push(`Stok produk "${p.title}" tidak mencukupi permintaan Anda (tersedia: ${availableStock} item).`);
        }
      }

      return {
        id: item.id,
        title: p.title,
        requestedQty: item.quantity,
        availableStock,
        isAvailable: availableStock > 0,
        hasExceeded,
        maxAllowedQty: availableStock,
      };
    });

    return {
      success: true,
      isValid,
      items: validatedItems,
      errorMessage: errors.length > 0 ? errors.join(' ') : undefined,
    };
  } catch (error: any) {
    console.error("Validate Cart Stock Error:", error);
    return {
      success: false,
      isValid: false,
      items: [],
      errorMessage: error.message || 'Gagal memvalidasi ketersediaan stok.',
    };
  }
}
