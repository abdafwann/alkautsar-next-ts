import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProducts,
  getProduct,
  getProductsByCategory,
  getShopProducts,
  getTotalProductsCount,
} from '@/app/actions/catalog';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

describe('Phase 3 Functional: Product Catalog Journey (C1–C7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('C1: Catalog Load & Serialized Pricing', () => {
    it('fetches products list with serialized numbers for price and promoPrice', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        {
          id: 'prod-1',
          title: 'Madu Hutan Al-Kautsar',
          slug: 'madu-hutan',
          price: 150000 as any,
          promoPrice: 120000 as any,
          promoExpiry: new Date('2026-12-31T23:59:59.000Z'),
          quantity: 25,
          category: { id: 'cat-1', name: 'Madu' },
          images: [{ id: 'img-1', url: 'https://res.cloudinary.com/madu.jpg' }],
        } as any,
      ]);

      const res = await getProducts();

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.data?.[0].price).toBe(150000);
      expect(res.data?.[0].promoPrice).toBe(120000);
      expect(typeof res.data?.[0].price).toBe('number');
    });

    it('retrieves total products count', async () => {
      vi.mocked(prisma.product.count).mockResolvedValue(42);

      const res = await getTotalProductsCount();

      expect(res.success).toBe(true);
      expect(res.data).toBe(42);
    });
  });

  describe('C2 & C3: Stock Status Classification (Out of Stock vs Low Stock)', () => {
    it('C2: filters inStock products when inStock filter is applied', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        {
          id: 'prod-instock',
          title: 'Produk Tersedia',
          price: 50000 as any,
          quantity: 10,
        } as any,
      ]);
      vi.mocked(prisma.product.count).mockResolvedValue(1);

      const res = await getShopProducts({ inStock: true });

      expect(res.success).toBe(true);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            quantity: { gt: 0 },
          }),
        })
      );
    });

    it('C3: correctly identifies low stock items (quantity <= 5)', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { id: 'p1', title: 'Stok Kritis', quantity: 2, price: 50000 as any },
        { id: 'p2', title: 'Stok Melimpah', quantity: 50, price: 50000 as any },
        { id: 'p3', title: 'Habis', quantity: 0, price: 50000 as any },
      ]);

      const res = await getProducts();
      const products = res.data || [];

      const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= 5);
      const outOfStockItems = products.filter(p => p.quantity === 0);

      expect(lowStockItems).toHaveLength(1);
      expect(lowStockItems[0].title).toBe('Stok Kritis');
      expect(outOfStockItems).toHaveLength(1);
      expect(outOfStockItems[0].title).toBe('Habis');
    });
  });

  describe('C4 & C5: Keyword Search in Shop Products', () => {
    it('C4: searches products matching title, uses, or slug', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        {
          id: 'prod-search-1',
          title: 'Habbatussauda Murni',
          uses: 'Meningkatkan daya tahan tubuh',
          price: 75000 as any,
          quantity: 15,
        } as any,
      ]);

      const res = await getShopProducts({ query: 'Habbatussauda' });

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'Habbatussauda', mode: 'insensitive' } },
              { uses: { contains: 'Habbatussauda', mode: 'insensitive' } },
              { slug: { contains: 'Habbatussauda', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('C5: handles empty results when search query does not match any product', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const res = await getShopProducts({ query: 'ProdukNonExistent123' });

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(0);
      expect(res.pagination?.totalProducts).toBe(0);
    });
  });

  describe('C6: Category Filter', () => {
    it('retrieves products filtered by specific category ID', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([
        {
          id: 'prod-cat-1',
          title: 'Minyak Zaitun Extra Virgin',
          categoryId: 'cat-herbal-oil',
          price: 90000 as any,
          quantity: 20,
        } as any,
      ]);

      const res = await getProductsByCategory('cat-herbal-oil');

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 'cat-herbal-oil' },
        })
      );
    });
  });

  describe('C7: Product Detail Fetch', () => {
    it('returns full product detail with category and images', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod-detail-1',
        title: 'Propolis Diamond',
        slug: 'propolis-diamond',
        price: 250000 as any,
        promoPrice: 200000 as any,
        promoExpiry: null,
        uses: 'Antibakteri dan antivirus alami',
        composition: '100% Brazilian Green Propolis',
        directions: 'Teteskan 3-5 tetes ke dalam air hangat',
        category: { id: 'cat-propolis', name: 'Propolis' },
        images: [{ url: 'https://res.cloudinary.com/propolis.png' }],
      } as any);

      const res = await getProduct('prod-detail-1');

      expect(res.success).toBe(true);
      expect(res.data?.title).toBe('Propolis Diamond');
      expect(res.data?.price).toBe(250000);
      expect(res.data?.promoPrice).toBe(200000);
      expect(res.data?.category?.name).toBe('Propolis');
    });

    it('returns null data when product ID is not found', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const res = await getProduct('non-existent-id');

      expect(res.success).toBe(true);
      expect(res.data).toBeNull();
    });
  });
});
