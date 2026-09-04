import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cartItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    }
  },
  setRlsContext: vi.fn(),
  clearRlsContext: vi.fn(),
}));

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

describe('Cart & Wishlist (Member vs Non-Member Guest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Guest Non-Member Handling', () => {
    it('should return empty cart without error for unauthenticated guest', async () => {
      const { getSession } = await import('@/lib/session');
      const { getDbCart, addToDbCart } = await import('@/app/actions/cart');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const cartRes = await getDbCart();
      expect(cartRes.success).toBe(true);
      expect(cartRes.guest).toBe(true);
      expect(cartRes.data).toEqual([]);

      const addRes = await addToDbCart('prod-1', 2);
      expect(addRes.success).toBe(true);
      expect(addRes.guest).toBe(true);
    });

    it('should return empty wishlist without error for unauthenticated guest', async () => {
      const { getSession } = await import('@/lib/session');
      const { getDbWishlist, toggleDbWishlist } = await import('@/app/actions/wishlist');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const wishlistRes = await getDbWishlist();
      expect(wishlistRes.success).toBe(true);
      expect(wishlistRes.guest).toBe(true);
      expect(wishlistRes.data).toEqual([]);

      const toggleRes = await toggleDbWishlist('prod-1');
      expect(toggleRes.success).toBe(true);
      expect(toggleRes.guest).toBe(true);
    });
  });

  describe('Real-Time Stock Validation', () => {
    it('should pass validation when requested quantity is within available stock', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { validateCartStock } = await import('@/app/actions/cart');

      (prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 'ambivo-1', title: 'Ambivo', quantity: 3 }
      ]);

      const res = await validateCartStock([{ id: 'ambivo-1', quantity: 2 }]);
      expect(res.success).toBe(true);
      expect(res.isValid).toBe(true);
      expect(res.items[0].hasExceeded).toBe(false);
      expect(res.items[0].availableStock).toBe(3);
    });

    it('should reject validation when requested quantity exceeds available stock', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { validateCartStock } = await import('@/app/actions/cart');

      (prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 'ambivo-1', title: 'Ambivo', quantity: 3 }
      ]);

      const res = await validateCartStock([{ id: 'ambivo-1', quantity: 4 }]);
      expect(res.success).toBe(true);
      expect(res.isValid).toBe(false);
      expect(res.items[0].hasExceeded).toBe(true);
      expect(res.items[0].availableStock).toBe(3);
      expect(res.errorMessage).toContain('Stok produk "Ambivo" tidak mencukupi permintaan Anda (tersedia: 3 item)');
    });
  });
});
