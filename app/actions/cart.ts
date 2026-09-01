'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redis } from '@/lib/redis';

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

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, productId, quantity }
      });
    }

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

    await prisma.cartItem.update({
      where: {
        userId_productId: { userId, productId }
      },
      data: { quantity }
    });

    await invalidateCartCache(userId);
    return { success: true };
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

    if (!guestItems || guestItems.length === 0) return { success: true };

    const guestProductIds = guestItems.map(i => i.id).filter(Boolean);
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
      if (!validProductMap.has(item.id)) continue;

      const existing = dbCartMap.get(item.id);
      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + (item.quantity || 1) }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId: item.id,
            quantity: Math.max(1, item.quantity || 1)
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
