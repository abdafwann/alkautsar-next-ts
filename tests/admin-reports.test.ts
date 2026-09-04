import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn(),
}));

describe('Admin Reports Actions (admin-reports.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSalesReport', () => {
    it('should reject unauthenticated requests', async () => {
      const { requireAdmin } = await import('@/lib/auth-guard');
      const { getSalesReport } = await import('@/app/actions/admin-reports');

      (requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unauthorized'));

      const result = await getSalesReport();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should return aggregated sales data and complete 12-month chart array', async () => {
      const { requireAdmin } = await import('@/lib/auth-guard');
      const { prisma } = await import('@/lib/prisma');
      const { getSalesReport } = await import('@/app/actions/admin-reports');

      (requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ adminId: '1', role: 'ADMIN' });

      (prisma.order.aggregate as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ _sum: { paymentAmount: 5000000 }, _count: { id: 25 } }) // current month
        .mockResolvedValueOnce({ _sum: { paymentAmount: 4000000 }, _count: { id: 20 } }); // last month

      (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await getSalesReport();

      expect(result.success).toBe(true);
      expect(result.data?.summary.revenue).toBe(5000000);
      expect(result.data?.summary.orders).toBe(25);
      expect(result.data?.summary.revenueGrowth).toBe(25); // (5M - 4M)/4M * 100
      expect(result.data?.summary.ordersGrowth).toBe(25);
      expect(result.data?.summary.averageOrderValue).toBe(200000);
      expect(result.data?.chartData).toHaveLength(12);
    });
  });
});
