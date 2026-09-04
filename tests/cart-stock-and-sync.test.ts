import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    cartItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
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

describe('Cart Stock Validation & Shop In-Stock Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToDbCart with Stock Validation', () => {
    it('should reject addToDbCart when product has 0 stock (out of stock)', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { addToDbCart } = await import('@/app/actions/cart');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });
      (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'prod-out-of-stock',
        title: 'Madu Hutan Kosong',
        quantity: 0,
      });

      const res = await addToDbCart('prod-out-of-stock', 1);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/stok habis|tidak tersedia/i);
    });

    it('should reject addToDbCart when quantity requested exceeds available stock', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { addToDbCart } = await import('@/app/actions/cart');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });
      (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'prod-limited-stock',
        title: 'Madu Terbatas',
        quantity: 2,
      });
      (prisma.cartItem.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'cart-item-1',
        quantity: 2,
      });

      const res = await addToDbCart('prod-limited-stock', 1);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/stok tidak mencukupi/i);
    });
  });

  describe('updateDbCartItem with Resilient Upsert & Stock Limits', () => {
    it('should use upsert to update or create cart item without throwing RecordNotFound', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { updateDbCartItem } = await import('@/app/actions/cart');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });
      (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'prod-item-1',
        title: 'Minyak Habbatussauda',
        quantity: 10,
      });
      (prisma.cartItem.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 'user-1',
        productId: 'prod-item-1',
        quantity: 3,
      });

      const res = await updateDbCartItem('prod-item-1', 3);
      expect(res.success).toBe(true);
      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_productId: { userId: 'user-1', productId: 'prod-item-1' } },
          update: { quantity: 3 },
          create: { userId: 'user-1', productId: 'prod-item-1', quantity: 3 }
        })
      );
    });

    it('should delete cart item and return error if product stock in DB is 0', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { updateDbCartItem } = await import('@/app/actions/cart');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });
      (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'prod-empty',
        title: 'Produk Habis',
        quantity: 0,
      });

      const res: any = await updateDbCartItem('prod-empty', 2);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/stok produk ini sedang habis/i);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', productId: 'prod-empty' }
      });
    });
  });

  describe('Catalog getShopProducts In-Stock Filter', () => {
    it('should filter by quantity > 0 when inStock filter is true', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getShopProducts } = await import('@/app/actions/catalog');

      (prisma.product.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.product.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      await getShopProducts({ inStock: true });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            quantity: { gt: 0 }
          })
        })
      );
    });
  });

  describe('Stock Level Classification (Out of Stock vs Low Stock)', () => {
    function getStockStatus(quantity: number | undefined) {
      if (quantity === undefined) return 'UNKNOWN';
      if (quantity <= 0) return 'OUT_OF_STOCK';
      if (quantity <= 5) return 'LOW_STOCK';
      return 'IN_STOCK';
    }

    it('should classify quantity <= 0 as OUT_OF_STOCK', () => {
      expect(getStockStatus(0)).toBe('OUT_OF_STOCK');
      expect(getStockStatus(-1)).toBe('OUT_OF_STOCK');
    });

    it('should classify quantity between 1 and 5 as LOW_STOCK', () => {
      expect(getStockStatus(1)).toBe('LOW_STOCK');
      expect(getStockStatus(3)).toBe('LOW_STOCK');
      expect(getStockStatus(5)).toBe('LOW_STOCK');
    });

    it('should classify quantity > 5 as normal IN_STOCK', () => {
      expect(getStockStatus(6)).toBe('IN_STOCK');
      expect(getStockStatus(100)).toBe('IN_STOCK');
    });
  });
});
