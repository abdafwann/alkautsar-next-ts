import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock('@/lib/prisma', () => ({
  prisma: {
    voucher: {
      findUnique: vi.fn(),
    },
  },
}));

// ─── Test Data ───────────────────────────────────────────────────
const createMockVoucher = (overrides: Record<string, any> = {}) => ({
  id: 'voucher-1',
  code: 'SEHAT20',
  isActive: true,
  expiryDate: new Date(Date.now() + 86400000), // tomorrow
  usageLimit: 100,
  usedCount: 10,
  minOrderAmount: 50000,
  type: 'PERCENTAGE',
  discountValue: 20,
  maxDiscount: 30000,
  ...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────
describe('checkVoucher Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Voucher Not Found ───────────────────────────────────────
  describe('Voucher Lookup', () => {
    it('should return error if voucher code does not exist', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await checkVoucher('INVALID_CODE', 100000);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak ditemukan/i);
    });

    it('should uppercase the code before lookup', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await checkVoucher('sehat20', 100000);
      expect(prisma.voucher.findUnique).toHaveBeenCalledWith({
        where: { code: 'SEHAT20' },
      });
    });
  });

  // ── Voucher Validity ────────────────────────────────────────
  describe('Voucher Validity Checks', () => {
    it('should reject inactive voucher', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ isActive: false })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak aktif/i);
    });

    it('should reject expired voucher', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ expiryDate: new Date('2020-01-01') })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/kedaluwarsa/i);
    });

    it('should reject voucher when usage limit is reached', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ usageLimit: 10, usedCount: 10 })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/kuota.*habis/i);
    });

    it('should allow voucher when usedCount is below usageLimit', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ usageLimit: 10, usedCount: 9 })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(true);
    });

    it('should allow voucher with no usage limit (null)', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ usageLimit: null, usedCount: 9999 })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(true);
    });
  });

  // ── Minimum Order Amount ────────────────────────────────────
  describe('Minimum Order Amount', () => {
    it('should reject when cart total is below minimum', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ minOrderAmount: 100000 })
      );

      const result = await checkVoucher('SEHAT20', 50000);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/minimal belanja/i);
    });

    it('should accept when cart total meets minimum exactly', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ minOrderAmount: 100000 })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(true);
    });

    it('should allow when no minimum order amount is set', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ minOrderAmount: null })
      );

      const result = await checkVoucher('SEHAT20', 1000);
      expect(result.success).toBe(true);
    });
  });

  // ── Promo/Flash Sale Items Guard ────────────────────────────
  describe('Promo Items Guard', () => {
    it('should reject voucher when normalItemsTotal is 0 (all promo items)', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ minOrderAmount: null })
      );

      const result = await checkVoucher('SEHAT20', 100000, 0);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/promo|flash sale/i);
    });
  });

  // ── Discount Calculation ────────────────────────────────────
  describe('Discount Calculation', () => {
    it('should calculate percentage discount correctly', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({
          type: 'PERCENTAGE',
          discountValue: 20,
          maxDiscount: null,
          minOrderAmount: null,
        })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(true);
      expect(result.data?.discountAmount).toBe(20000); // 20% of 100000
    });

    it('should cap percentage discount at maxDiscount', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({
          type: 'PERCENTAGE',
          discountValue: 50,
          maxDiscount: 25000,
          minOrderAmount: null,
        })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(true);
      expect(result.data?.discountAmount).toBe(25000); // 50% = 50000, capped at 25000
    });

    it('should use fixed discount value for FIXED type', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({
          type: 'FIXED',
          discountValue: 15000,
          minOrderAmount: null,
        })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(true);
      expect(result.data?.discountAmount).toBe(15000);
    });

    it('should cap discount at normalItemsTotal to prevent negative totals', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({
          type: 'FIXED',
          discountValue: 50000,
          minOrderAmount: null,
        })
      );

      // normalItemsTotal = 20000 (less than discount 50000)
      const result = await checkVoucher('SEHAT20', 30000, 20000);
      expect(result.success).toBe(true);
      expect(result.data?.discountAmount).toBe(20000); // capped at normalItemsTotal
    });

    it('should return correct voucher metadata on success', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { checkVoucher } = await import('@/app/actions/voucher');

      (prisma.voucher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockVoucher({ minOrderAmount: null })
      );

      const result = await checkVoucher('SEHAT20', 100000);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'voucher-1',
        code: 'SEHAT20',
        discountAmount: expect.any(Number),
        discountType: 'PERCENTAGE',
        discountValue: 20,
      });
    });
  });
});
