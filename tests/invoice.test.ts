import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { requireAdmin } from '@/lib/auth-guard';
import { createOrderClaimToken } from '@/lib/order-security';

const { mockCookieStore } = vi.hoisted(() => ({
  mockCookieStore: {
    get: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
  encodedKey: new TextEncoder().encode('test-secret-key-for-jwt-signing-minimum-32-chars-long!'),
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn(),
}));

describe('Invoice Server Action (invoice.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    mockCookieStore.get.mockReturnValue(undefined);
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Unauthorized'));
    vi.mocked(prisma.order.update).mockResolvedValue({} as any);
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

  it('should reject unauthorized access if caller is not member, admin, or claim holder', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { getInvoiceData } = await import('@/app/actions/invoice');

    (prisma.order.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-test-12345',
      orderId: 'ORDER-2026-001',
      userId: 'u-owner',
      orderItems: [],
    });

    const result = await getInvoiceData('order-test-12345');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Akses ditolak');
  });

  it('should format real order from database when requested by owner member', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { getInvoiceData } = await import('@/app/actions/invoice');

    vi.mocked(getSession).mockResolvedValue({ userId: 'u-1' } as any);

    (prisma.order.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-test-12345',
      orderId: 'ORDER-2026-001',
      invoiceId: 'INV/20260830/ALK/12345',
      userId: 'u-1',
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

  it('should allow access for guest holding valid order claim token cookie', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { getInvoiceData } = await import('@/app/actions/invoice');

    const token = await createOrderClaimToken('ORDER-2026-001', 'guest@example.com');
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === 'order_claim_ORDER-2026-001') return { value: token };
      return undefined;
    });

    (prisma.order.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'order-test-guest',
      orderId: 'ORDER-2026-001',
      userId: null,
      createdAt: new Date('2026-08-30T10:00:00Z'),
      updatedAt: new Date('2026-08-30T10:05:00Z'),
      paymentStatus: 'PAID',
      paymentType: 'qris',
      orderStatus: 'PROCESSING',
      guestName: 'Guest Buyer',
      guestEmail: 'guest@example.com',
      orderItems: [],
    });

    const result = await getInvoiceData('ORDER-2026-001');
    expect(result.success).toBe(true);
    expect(result.data?.orderId).toBe('ORDER-2026-001');
  });
});
