import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn(),
}));

describe('Catalog Search Integration (getShopProducts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass search query in whereClause.OR when query filter is supplied', async () => {
    const { getShopProducts } = await import('@/app/actions/catalog');
    const { prisma } = await import('@/lib/prisma');

    (prisma.product.findMany as any).mockResolvedValue([
      {
        id: 'prod-honey-1',
        title: 'Madu Hutan Asli',
        slug: 'madu-hutan-asli',
        uses: 'Meningkatkan imunitas',
        price: '120000',
        promoPrice: null,
        category: { id: 'cat-1', name: 'Madu' },
        images: [{ url: '/honey.jpg' }]
      }
    ]);

    const result = await getShopProducts({ query: 'Madu Hutan' });

    expect(result.success).toBe(true);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'Madu Hutan', mode: 'insensitive' } },
            { uses: { contains: 'Madu Hutan', mode: 'insensitive' } },
            { slug: { contains: 'Madu Hutan', mode: 'insensitive' } },
          ]
        })
      })
    );
  });

  it('should ignore whitespace-only query and not include OR filter', async () => {
    const { getShopProducts } = await import('@/app/actions/catalog');
    const { prisma } = await import('@/lib/prisma');

    (prisma.product.findMany as any).mockResolvedValue([]);

    const result = await getShopProducts({ query: '   ' });

    expect(result.success).toBe(true);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          OR: expect.anything()
        })
      })
    );
  });
});
