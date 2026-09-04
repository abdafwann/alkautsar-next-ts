import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn(),
}));

describe('Invoice Server Action (invoice.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return sample invoice data when requesting sample or preview', async () => {
    const { getInvoiceData } = await import('@/app/actions/invoice');
    const result = await getInvoiceData('sample');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.company.name).toContain('AL-KAUTSAR');
    expect(result.data?.items.length).toBeGreaterThan(0);
    expect(result.data?.pricing.grandTotal).toBeGreaterThan(0);
  });

  it('should format real order from database into structured invoice', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { getInvoiceData } = await import('@/app/actions/invoice');

    (prisma.order.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-test-12345',
      orderId: 'ORDER-2026-001',
      invoiceId: 'INV/20260830/ALK/12345',
      createdAt: new Date('2026-08-30T10:00:00Z'),
      updatedAt: new Date('2026-08-30T10:05:00Z'),
      paymentStatus: 'PAID',
      paymentType: 'qris',
      orderStatus: 'PROCESSING',
      courier: 'JNE Reguler',
      resi: 'JNE123456789',
      shippingName: 'Budi Santoso',
      shippingMobile: '081234567890',
      shippingAddress: 'Jl. Merdeka No. 1',
      shippingProvince: 'Jawa Barat',
      shippingCity: 'Bandung',
      shippingPostalCode: '40115',
      shippingNote: 'Tolong jangan dibanting',
      paymentAmount: 185000,
      discountAmount: 15000,
      voucherCode: 'DISKON15K',
      user: { id: 'u-1', name: 'Budi Santoso', email: 'budi@example.com' },
      orderItems: [
        {
          id: 'item-1',
          count: 2,
          price: 100000,
          product: { id: 'p-1', title: 'Minyak Habbatussauda', productForm: 'Cair / Minyak' }
        }
      ]
    });

    const result = await getInvoiceData('order-test-12345');

    expect(result.success).toBe(true);
    expect(result.data?.invoiceNumber).toBe('INV/20260830/ALK/12345');
    expect(result.data?.customer.name).toBe('Budi Santoso');
    expect(result.data?.items[0].title).toBe('Minyak Habbatussauda');
    expect(result.data?.items[0].total).toBe(200000);
    expect(result.data?.pricing.discountAmount).toBe(15000);
    expect(result.data?.pricing.grandTotal).toBe(185000);
  });
});
