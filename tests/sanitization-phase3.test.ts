import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
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

describe('Phase 3: Query & Utility Parameters Sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TASK-10: searchProductsLive Sanitization', () => {
    it('should return empty list if query is empty or shorter than 2 characters after sanitization', async () => {
      const { searchProductsLive } = await import('@/app/actions/catalog');

      const res1 = await searchProductsLive('  ');
      expect(res1.success).toBe(true);
      expect(res1.data).toEqual([]);

      const res2 = await searchProductsLive('<>');
      expect(res2.success).toBe(true);
      expect(res2.data).toEqual([]);
    });

    it('should sanitize search query before passing to Prisma contains', async () => {
      const { searchProductsLive } = await import('@/app/actions/catalog');
      const { prisma } = await import('@/lib/prisma');

      (prisma.product.findMany as any).mockResolvedValue([
        {
          id: 'prod-1',
          title: 'Habbatussauda Murni',
          slug: 'habbatussauda-murni',
          price: 75000,
          promoPrice: null,
          images: [],
          category: { name: 'Kapsul' },
        },
      ]);

      const maliciousQuery = '<script>alert(1)</script>Habbatussauda';
      const result = await searchProductsLive(maliciousQuery);

      expect(result.success).toBe(true);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'scriptalert(1)/scriptHabbatussauda', mode: 'insensitive' } },
              { slug: { contains: 'scriptalert(1)/scriptHabbatussauda', mode: 'insensitive' } },
            ],
          },
        })
      );
    });
  });

  describe('TASK-11: mergeGuestCart Sanitization', () => {
    it('should safely parse and cap quantities from guest cart items', async () => {
      const { mergeGuestCart } = await import('@/app/actions/cart');
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');

      (getSession as any).mockResolvedValue({ userId: 'user-member-1' });

      (prisma.product.findMany as any).mockResolvedValue([
        { id: 'prod-1' },
        { id: 'prod-2' },
      ]);

      (prisma.cartItem.findMany as any).mockResolvedValue([
        { id: 'cart-item-1', productId: 'prod-1', quantity: 2 },
      ]);

      const guestItems = [
        { id: 'prod-1', quantity: 3.8 }, // float quantity
        { id: 'prod-2', quantity: -10 }, // negative quantity
        { id: 'prod-3', quantity: 5 },   // non-existent product
      ];

      const result = await mergeGuestCart(guestItems);
      expect(result.success).toBe(true);

      // Existing item should be incremented with Math.floor(3.8) = 3 -> total = 5
      expect(prisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cart-item-1' },
          data: { quantity: 5 },
        })
      );

      // New item with negative qty (-10) should fallback to safe minimum (1)
      expect(prisma.cartItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-member-1',
            productId: 'prod-2',
            quantity: 1,
          }),
        })
      );
    });
  });
});
