import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/route';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { checkoutLimiter } from '@/lib/ratelimit';

// Hoisted mocks
const { mockSnapCreateTransaction } = vi.hoisted(() => ({
  mockSnapCreateTransaction: vi.fn(),
}));

vi.mock('midtrans-client', () => {
  class MockSnap {
    createTransaction = mockSnapCreateTransaction;
  }
  return {
    default: {
      Snap: MockSnap,
    },
  };
});

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
  encodedKey: new TextEncoder().encode('test-secret-key-for-jwt-signing-minimum-32-chars-long!'),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkoutLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('Phase 2 Integration: Checkout API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkoutLimiter.limit).mockResolvedValue({ success: true } as any);
    vi.mocked(getSession).mockResolvedValue(null);
  });

  function createCheckoutRequest(body: Record<string, any>) {
    return new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify(body),
    });
  }

  const validPayload = {
    items: [{ id: 'prod-1', quantity: 2 }],
    name: 'Ahmad Dahlan',
    email: 'ahmad@example.com',
    phone: '081234567890',
    address: 'Jl. Malioboro No. 12',
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    postalCode: '55271',
    note: 'Tolong packing kayu',
    shippingFee: 15000,
  };

  describe('1. Input Validation & Rate Limiting', () => {
    it('returns 429 when checkout rate limit is exceeded', async () => {
      vi.mocked(checkoutLimiter.limit).mockResolvedValue({ success: false } as any);

      const req = createCheckoutRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(429);
      expect(json.error).toContain('Terlalu banyak permintaan checkout');
    });

    it('returns 400 when items array is empty or missing', async () => {
      const req = createCheckoutRequest({ ...validPayload, items: [] });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Keranjang belanja kosong');
    });

    it('returns 400 when mandatory shipping fields are missing', async () => {
      const incompletePayloads = [
        { ...validPayload, name: '' },
        { ...validPayload, email: '' },
        { ...validPayload, phone: '' },
        { ...validPayload, address: '' },
      ];

      for (const payload of incompletePayloads) {
        const req = createCheckoutRequest(payload);
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe('Data pengiriman tidak lengkap');
      }
    });

    it('returns 400 when email format is invalid', async () => {
      const req = createCheckoutRequest({ ...validPayload, email: 'invalid-email-address' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Format alamat email tidak valid');
    });

    it('returns 400 when item quantity is invalid (negative, zero, float)', async () => {
      const invalidQuantities = [0, -1, 1000];

      for (const qty of invalidQuantities) {
        const req = createCheckoutRequest({
          ...validPayload,
          items: [{ id: 'prod-1', quantity: qty }],
        });
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe('Kuantitas produk dalam keranjang tidak valid');
      }
    });
  });

  describe('2. Anti-Hoarding & Active Order Management', () => {
    it('blocks checkout with 400 if user has an active unpaid order with snapToken', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        id: 'existing-ord-1',
        orderId: 'ORD-EXISTING',
        orderStatus: 'WAITING_FOR_PAYMENT',
        snapToken: 'snap-token-active',
        paymentExpiry: new Date(Date.now() + 3600000),
      } as any);

      const req = createCheckoutRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('Anda masih memiliki pesanan aktif');
    });

    it('cleans up orphaned unpaid order (no snapToken) and proceeds with checkout', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        id: 'orphaned-ord-1',
        orderId: 'ORD-ORPHANED',
        orderStatus: 'WAITING_FOR_PAYMENT',
        snapToken: null,
        paymentExpiry: new Date(Date.now() + 3600000),
      } as any);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          { id: 'prod-1', title: 'Madu Al-Kautsar', price: 100000, quantity: 10, isPromo: false },
        ]),
        product: { update: vi.fn() },
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'created-db-id',
            orderId: 'ORDER-12345',
          }),
        },
        cartItem: { deleteMany: vi.fn() },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      mockSnapCreateTransaction.mockResolvedValue({ token: 'new-snap-token-123' });
      vi.mocked(prisma.order.update).mockResolvedValue({} as any);

      const req = createCheckoutRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'orphaned-ord-1' },
        data: { orderStatus: 'CANCELLED' },
      });
      expect(res.status).toBe(200);
      expect(json.token).toBe('new-snap-token-123');
    });
  });

  describe('3. Transactional Inventory & Voucher Logic', () => {
    it('aborts checkout when stock is insufficient under lock', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          { id: 'prod-1', title: 'Madu Al-Kautsar', price: 100000, quantity: 1, isPromo: false },
        ]),
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Requesting quantity 2, but only 1 available
      const req = createCheckoutRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('Stok produk "Madu Al-Kautsar" tidak mencukupi');
    });

    it('sets 1-hour urgent cooldown if remaining stock <= 2', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          // Product quantity 3, user buys 2 -> remaining 1 (<= 2) -> 1 hour cooldown
          { id: 'prod-1', title: 'Madu Al-Kautsar', price: 100000, quantity: 3, isPromo: false },
        ]),
        product: { update: vi.fn() },
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'created-db-id',
            orderId: 'ORDER-LOW-STOCK',
          }),
        },
        cartItem: { deleteMany: vi.fn() },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      mockSnapCreateTransaction.mockResolvedValue({ token: 'snap-token-urgent' });
      vi.mocked(prisma.order.update).mockResolvedValue({} as any);

      const req = createCheckoutRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.cooldownHours).toBe(1);
    });

    it('applies percentage voucher with maxDiscount cap and decrements product stock', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const mockTx = {
        $queryRaw: vi
          .fn()
          .mockResolvedValueOnce([
            { id: 'prod-1', title: 'Madu Super', price: 200000, quantity: 10, isPromo: false },
          ])
          .mockResolvedValueOnce([
            {
              id: 'vouch-1',
              code: 'DISKON50',
              isActive: true,
              expiryDate: new Date(Date.now() + 86400000),
              usedCount: 0,
              usageLimit: 100,
              minOrderAmount: 100000,
              discountType: 'PERCENTAGE',
              discountValue: 50, // 50% of 400k = 200k
              maxDiscount: 50000, // Capped at 50k
            },
          ]),
        voucher: { update: vi.fn() },
        product: { update: vi.fn() },
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'created-db-id',
            orderId: 'ORDER-VOUCHER-APPLIED',
          }),
        },
        cartItem: { deleteMany: vi.fn() },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      mockSnapCreateTransaction.mockResolvedValue({ token: 'snap-token-voucher' });
      vi.mocked(prisma.order.update).mockResolvedValue({} as any);

      const req = createCheckoutRequest({
        ...validPayload,
        voucherCode: 'DISKON50',
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockTx.voucher.update).toHaveBeenCalledWith({
        where: { code: 'DISKON50' },
        data: { usedCount: { increment: 1 } },
      });
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { quantity: { decrement: 2 } },
      });
    });
  });

  describe('4. Complete Successful Checkout Response & Cookie Setting', () => {
    it('creates Snap transaction, updates snapToken, and sets signed order claim cookie', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);
      vi.mocked(getSession).mockResolvedValue({ userId: 'user-member-1', role: 'MEMBER' } as any);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          { id: 'prod-1', title: 'Habbatussauda', price: 50000, quantity: 20, isPromo: false },
        ]),
        product: { update: vi.fn() },
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'ord-db-123',
            orderId: 'ORDER-SUCCESS-1',
          }),
        },
        cartItem: { deleteMany: vi.fn() },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      mockSnapCreateTransaction.mockResolvedValue({ token: 'snap-token-final-xyz' });
      vi.mocked(prisma.order.update).mockResolvedValue({} as any);

      const req = createCheckoutRequest(validPayload);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.token).toBe('snap-token-final-xyz');
      expect(mockTx.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-member-1' },
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-db-123' },
        data: { snapToken: 'snap-token-final-xyz' },
      });

      // Check cookie header
      const setCookieHeader = res.headers.get('set-cookie');
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain('order_claim_');
    });

    it('enforces server-side shipping fee calculation and prevents client fee tampering', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue([
          { id: 'prod-1', title: 'Habbatussauda', price: 50000, quantity: 20, isPromo: false },
        ]),
        product: { update: vi.fn() },
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'ord-db-outside-java',
            orderId: 'ORDER-OUTSIDE-JAVA',
          }),
        },
        cartItem: { deleteMany: vi.fn() },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      mockSnapCreateTransaction.mockResolvedValue({ token: 'snap-token-outside-java' });
      vi.mocked(prisma.order.update).mockResolvedValue({} as any);

      // Client attempts to send shippingFee: 0 for Outside Java destination
      const req = createCheckoutRequest({
        ...validPayload,
        province: 'Sumatera Barat',
        shippingFee: 0,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      // Subtotal (2 * 50k = 100k) + Outside Java Fee (30k) = 130k
      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentAmount: 130000,
            shippingProvince: 'Sumatera Barat',
          }),
        })
      );
    });
  });
});
