'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function getDbCart() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Not authenticated' };

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId as string },
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
      discountPercentage: item.product.promoPercentage,
      imageUrl: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : 'https://placehold.co/400x400?text=No+Image',
      slug: item.product.slug,
      quantity: item.quantity
    }));

    return { success: true, data: formattedCart };
  } catch (error: any) {
    console.error("Get DB Cart Error:", error);
    return { success: false, error: error.message };
  }
}

export async function addToDbCart(productId: string, quantity: number = 1) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Not authenticated' };
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

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDbCartItem(productId: string, quantity: number) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Not authenticated' };
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

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeFromDbCart(productId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Not authenticated' };
    const userId = session.userId as string;

    await prisma.cartItem.delete({
      where: {
        userId_productId: { userId, productId }
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clearDbCart() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Not authenticated' };
    const userId = session.userId as string;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function mergeGuestCart(guestItems: any[]) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Not authenticated' };
    const userId = session.userId as string;

    if (!guestItems || guestItems.length === 0) return { success: true };

    // Get current DB cart
    const dbCart = await prisma.cartItem.findMany({
      where: { userId }
    });

    const dbCartMap = new Map(dbCart.map(item => [item.productId, item]));

    // Merge logic
    for (const item of guestItems) {
      const existing = dbCartMap.get(item.id);
      if (existing) {
        // If it exists in DB, add the quantities
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity }
        });
      } else {
        // Create new
        await prisma.cartItem.create({
          data: { userId, productId: item.id, quantity: item.quantity }
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Merge Cart Error:", error);
    return { success: false, error: error.message };
  }
}
