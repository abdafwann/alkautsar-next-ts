'use server';

import { prisma, setRlsContext, clearRlsContext } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redis } from '@/lib/redis';

const WISHLIST_CACHE_TTL = 300; // 5 minutes

interface DbWishlistItem {
  id: string;
  title: string;
  price: number;
  promoPrice: number | null;
  promoPercentage: number | null;
  slug: string;
  images: { url: string }[];
}

async function getCachedWishlist(userId: string): Promise<DbWishlistItem[] | null> {
  try {
    const cacheKey = `wishlist:${userId}`;
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    return null;
  }
  return null;
}

async function setWishlistCache(userId: string, data: DbWishlistItem[]) {
  try {
    const cacheKey = `wishlist:${userId}`;
    await redis.set(cacheKey, JSON.stringify(data), { ex: WISHLIST_CACHE_TTL });
  } catch {
    // Non-blocking
  }
}

async function invalidateWishlistCache(userId: string) {
  try {
    const cacheKey = `wishlist:${userId}`;
    await redis.del(cacheKey);
  } catch {
    // Non-blocking
  }
}

export async function toggleDbWishlist(productId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: true, guest: true };
    }

    const userId = session.userId as string;

    setRlsContext({
      userId,
      isAdmin: false,
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wishlist: true }
    });

    if (!user) {
      clearRlsContext();
      return { success: false, error: 'User tidak ditemukan' };
    }

    const exists = user.wishlist.some(p => p.id === productId);

    if (exists) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          wishlist: {
            disconnect: { id: productId }
          }
        }
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          wishlist: {
            connect: { id: productId }
          }
        }
      });
    }

    clearRlsContext();
    await invalidateWishlistCache(userId);

    return { success: true, isWishlisted: !exists };
  } catch (error: any) {
    console.error('toggleDbWishlist error:', error);
    clearRlsContext();
    return { success: false, error: error.message || 'Gagal update wishlist' };
  }
}

export async function syncWishlistToDb(localProductIds: string[]) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: true, guest: true, data: [] };

    const userId = session.userId as string;

    setRlsContext({
      userId,
      isAdmin: false,
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wishlist: true }
    });

    if (!user) {
      clearRlsContext();
      return { success: false, error: 'User tidak ditemukan' };
    }

    // Find products that exist in DB to prevent foreign key errors
    const validProducts = await prisma.product.findMany({
      where: { id: { in: localProductIds } },
      select: { id: true }
    });
    const validIds = validProducts.map(p => p.id);

    const existingIds = user.wishlist.map(p => p.id);
    const newIds = validIds.filter(id => !existingIds.includes(id));

    if (newIds.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          wishlist: {
            connect: newIds.map(id => ({ id }))
          }
        }
      });
    }

    await invalidateWishlistCache(userId);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wishlist: {
          select: {
            id: true,
            title: true,
            price: true,
            promoPrice: true,
            promoPercentage: true,
            slug: true,
            images: { take: 1 }
          }
        }
      }
    });

    clearRlsContext();
    return { success: true, data: updatedUser?.wishlist || [] };
  } catch (error: any) {
    console.error('syncWishlistToDb error:', error);
    clearRlsContext();
    return { success: false, error: error.message || 'Gagal sinkronisasi wishlist' };
  }
}

export async function clearDbWishlist() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: true, guest: true };

    const userId = session.userId as string;

    setRlsContext({
      userId,
      isAdmin: false,
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        wishlist: {
          set: []
        }
      }
    });

    clearRlsContext();
    await invalidateWishlistCache(userId);

    return { success: true };
  } catch (error: any) {
    console.error('clearDbWishlist error:', error);
    clearRlsContext();
    return { success: false, error: error.message || 'Gagal membersihkan wishlist' };
  }
}

export async function getDbWishlist() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: true, guest: true, data: [] };
    }

    const userId = session.userId as string;

    setRlsContext({
      userId,
      isAdmin: false,
    });

    const cached = await getCachedWishlist(userId);
    if (cached) {
      clearRlsContext();
      return { success: true, data: cached, cached: true };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wishlist: {
          select: {
            id: true,
            title: true,
            price: true,
            promoPrice: true,
            promoPercentage: true,
            slug: true,
            images: { take: 1 }
          }
        }
      }
    });

    clearRlsContext();

    const rawWishlist = user?.wishlist || [];

    const wishlistData: DbWishlistItem[] = rawWishlist.map(item => ({
      id: item.id,
      title: item.title,
      price: Number(item.price),
      promoPrice: item.promoPrice ? Number(item.promoPrice) : null,
      promoPercentage: item.promoPercentage ? Number(item.promoPercentage) : null,
      slug: item.slug,
      images: item.images.map(img => ({ url: img.url }))
    }));

    await setWishlistCache(userId, wishlistData);

    return { success: true, data: wishlistData };
  } catch (error: any) {
    console.error('getDbWishlist error:', error);
    clearRlsContext();
    return { success: false, error: error.message || 'Gagal mengambil wishlist' };
  }
}
