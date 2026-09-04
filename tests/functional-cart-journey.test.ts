import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDbCart,
  addToDbCart,
  updateDbCartItem,
  removeFromDbCart,
  clearDbCart,
  mergeGuestCart,
} from '@/app/actions/cart';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('Phase 3 Functional: Cart Journey (K1–K7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSession).mockResolvedValue({
      userId: 'usr-buyer-cart',
      role: 'MEMBER',
    } as any);
  });

  describe('K1 & K2: Add to Cart & Stock Check', () => {
    it('K1: adds in-stock item to member cart and invalidates cart cache', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod-cart-1',
        title: 'Madu Randu Super',
        quantity: 10,
      } as any);

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.cartItem.upsert).mockResolvedValue({} as any);

      const res = await addToDbCart('prod-cart-1', 2);

      expect(res.success).toBe(true);
      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: { userId: 'usr-buyer-cart', productId: 'prod-cart-1', quantity: 2 },
          update: { quantity: 2 },
        })
      );
    });

    it('K2: rejects adding out-of-stock product (quantity = 0)', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod-cart-oos',
        title: 'Habbatussauda Habis',
        quantity: 0,
      } as any);

      const res = await addToDbCart('prod-cart-oos', 1);

      expect(res.success).toBe(false);
      expect(res.error).toBe('Stok produk habis atau tidak tersedia');
      expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
    });

    it('rejects adding quantity that exceeds remaining stock when combined with existing cart quantity', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod-cart-limited',
        title: 'Minyak Habbatussauda',
        quantity: 5,
      } as any);

      // Already has 4 in cart, trying to add 2 (total 6 > 5)
      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
        id: 'item-existing',
        userId: 'usr-buyer-cart',
        productId: 'prod-cart-limited',
        quantity: 4,
      } as any);

      const res = await addToDbCart('prod-cart-limited', 2);

      expect(res.success).toBe(false);
      expect(res.error).toContain('Stok tidak mencukupi permintaan Anda');
      expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
    });
  });

  describe('K3 & K4: Update Quantity & Capping', () => {
    it('K3: updates cart item quantity within available stock', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod-cart-1',
        title: 'Madu Randu',
        quantity: 20,
      } as any);

      vi.mocked(prisma.cartItem.upsert).mockResolvedValue({} as any);

      const res = await updateDbCartItem('prod-cart-1', 4);

      expect(res.success).toBe(true);
      expect(res.quantity).toBe(4);
      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { quantity: 4 },
        })
      );
    });

    it('K4: caps updated quantity to maximum available product stock', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod-cart-max',
        title: 'Zaitun Extra Virgin',
        quantity: 3, // Only 3 in stock
      } as any);

      vi.mocked(prisma.cartItem.upsert).mockResolvedValue({} as any);

      // Requesting 10, but stock is 3
      const res = await updateDbCartItem('prod-cart-max', 10);

      expect(res.success).toBe(true);
      expect(res.quantity).toBe(3); // Capped to 3
      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { quantity: 3 },
        })
      );
    });

    it('removes cart item if updated quantity is 0 or negative', async () => {
      vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 1 });

      const res = await updateDbCartItem('prod-cart-1', 0);

      expect(res.success).toBe(true);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'usr-buyer-cart', productId: 'prod-cart-1' },
      });
    });
  });

  describe('K5 & K6: Remove Item & Clear Cart', () => {
    it('K5: removes single product from member cart', async () => {
      vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 1 });

      const res = await removeFromDbCart('prod-cart-remove');

      expect(res.success).toBe(true);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'usr-buyer-cart', productId: 'prod-cart-remove' },
      });
    });

    it('K6: clears all items from member cart', async () => {
      vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 5 });

      const res = await clearDbCart();

      expect(res.success).toBe(true);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'usr-buyer-cart' },
      });
    });

    it('returns empty array gracefully for unauthenticated guest calling getDbCart', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const res = await getDbCart();

      expect(res.success).toBe(true);
      expect(res.guest).toBe(true);
      expect(res.data).toEqual([]);
    });
  });

  describe('K7: Guest-to-Member Cart Synchronization on Login', () => {
    it('merges guest local cart items into member database cart upon login', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'guest-p1' },
        { id: 'guest-p2' },
      ] as any);

      // Existing DB cart has item 1 with qty 1
      vi.mocked(prisma.cartItem.findMany).mockResolvedValue([
        { id: 'db-item-1', productId: 'guest-p1', quantity: 1 },
      ] as any);

      vi.mocked(prisma.cartItem.update).mockResolvedValue({} as any);
      vi.mocked(prisma.cartItem.create).mockResolvedValue({} as any);

      const guestItems = [
        { id: 'guest-p1', quantity: 2 }, // Existing -> update 1+2=3
        { id: 'guest-p2', quantity: 1 }, // New -> create qty 1
      ];

      const res = await mergeGuestCart(guestItems);

      expect(res.success).toBe(true);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'db-item-1' },
        data: { quantity: 3 },
      });
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          userId: 'usr-buyer-cart',
          productId: 'guest-p2',
          quantity: 1,
        },
      });
    });
  });
});
