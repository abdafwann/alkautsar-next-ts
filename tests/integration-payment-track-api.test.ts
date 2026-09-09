import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getPayment } from '@/app/api/payment/[orderId]/route';
import { POST as postTrackOrder } from '@/app/api/track-order/route';
import { GET as getHealth } from '@/app/api/health/route';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { createOrderClaimToken } from '@/lib/order-security';
import { performHealthCheck } from '@/lib/monitoring';

// Hoisted mocks
const { mockCookieStore } = vi.hoisted(() => ({
  mockCookieStore: {
    get: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
  encodedKey: new TextEncoder().encode('test-secret-key-for-jwt-signing-minimum-32-chars-long!'),
}));

vi.mock('@/lib/monitoring', () => ({
  performHealthCheck: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

vi.mock('midtrans-client', () => {
  class MockCoreApi {
    transaction = {
      status: vi.fn().mockResolvedValue({ transaction_status: 'pending' }),
    };
  }
  return {
    default: {
      CoreApi: MockCoreApi,
    },
  };
});

describe('Phase 2 Integration: Payment, Track Order, and Health APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    mockCookieStore.get.mockReturnValue(undefined);
    vi.mocked(getSession).mockResolvedValue(null);
  });

  describe('1. GET /api/payment/[orderId]', () => {
    it('returns 404 if order does not exist', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/payment/ORD-NOT-FOUND');
      const params = Promise.resolve({ orderId: 'ORD-NOT-FOUND' });
      const res = await getPayment(req, { params });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Pesanan tidak ditemukan');
    });

    it('returns unmasked PII for verified authenticated owner', async () => {
      vi.mocked(getSession).mockResolvedValue({ userId: 'user-auth-1' } as any);
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        id: 'db-ord-1',
        orderId: 'ORD-AUTH-1',
        userId: 'user-auth-1',
        guestName: 'Budi Santoso',
        guestEmail: 'budi@example.com',
        shippingName: 'Budi Santoso',
        shippingMobile: '081234567890',
        shippingAddress: 'Jl. Sudirman No. 45',
        shippingCity: 'Jakarta Selatan',
        shippingProvince: 'DKI Jakarta',
        shippingPostalCode: '12190',
        paymentAmount: 250000,
        paymentExpiry: new Date(Date.now() + 3600000),
        paymentStatus: 'UNPAID',
        orderStatus: 'WAITING_FOR_PAYMENT',
        snapToken: 'snap-token-1',
        orderItems: [],
        user: { id: 'user-auth-1', name: 'Budi Santoso', email: 'budi@example.com' },
      } as any);

      const req = new Request('http://localhost:3000/api/payment/ORD-AUTH-1');
      const params = Promise.resolve({ orderId: 'ORD-AUTH-1' });
      const res = await getPayment(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.order.guestName).toBe('Budi Santoso');
      expect(json.order.guestEmail).toBe('budi@example.com');
      expect(json.order.shippingMobile).toBe('081234567890');
      expect(json.order.shippingAddress).toBe('Jl. Sudirman No. 45');
    });

    it('returns unmasked PII for guest with valid signed claim token cookie', async () => {
      const claimToken = await createOrderClaimToken('ORD-GUEST-1', 'guest@example.com');
      mockCookieStore.get.mockReturnValue({ value: claimToken });

      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        id: 'db-ord-guest-1',
        orderId: 'ORD-GUEST-1',
        userId: null,
        guestName: 'Siti Aminah',
        guestEmail: 'guest@example.com',
        shippingName: 'Siti Aminah',
        shippingMobile: '085678901234',
        shippingAddress: 'Jl. Pemuda No. 10',
        shippingCity: 'Semarang',
        shippingProvince: 'Jawa Tengah',
        shippingPostalCode: '50132',
        paymentAmount: 180000,
        paymentExpiry: new Date(Date.now() + 3600000),
        paymentStatus: 'UNPAID',
        orderStatus: 'WAITING_FOR_PAYMENT',
        snapToken: 'snap-token-guest',
        orderItems: [],
      } as any);

      const req = new Request('http://localhost:3000/api/payment/ORD-GUEST-1');
      const params = Promise.resolve({ orderId: 'ORD-GUEST-1' });
      const res = await getPayment(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.order.guestEmail).toBe('guest@example.com');
      expect(json.order.shippingMobile).toBe('085678901234');
      expect(json.order.shippingAddress).toBe('Jl. Pemuda No. 10');
    });

    it('masks PII when requester is unverified (no session, no claim token, no matching email)', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        id: 'db-ord-unverified',
        orderId: 'ORD-UNVERIFIED',
        userId: 'some-other-user',
        guestName: 'John Doe',
        guestEmail: 'johndoe@example.com',
        shippingName: 'John Doe',
        shippingMobile: '081987654321',
        shippingAddress: 'Jl. Rahasia No. 99',
        shippingCity: 'Bandung',
        shippingProvince: 'Jawa Barat',
        shippingPostalCode: '40115',
        paymentAmount: 300000,
        paymentExpiry: new Date(Date.now() + 3600000),
        paymentStatus: 'UNPAID',
        orderStatus: 'WAITING_FOR_PAYMENT',
        snapToken: 'snap-token-masked',
        orderItems: [],
        user: { id: 'some-other-user', name: 'John Doe', email: 'johndoe@example.com' },
      } as any);

      const req = new Request('http://localhost:3000/api/payment/ORD-UNVERIFIED');
      const params = Promise.resolve({ orderId: 'ORD-UNVERIFIED' });
      const res = await getPayment(req, { params });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      // PII should be masked
      expect(json.order.isOwner).toBe(false);
      expect(json.order.guestName).not.toBe('John Doe');
      expect(json.order.guestEmail).toContain('***@example.com');
      expect(json.order.trackEmail).toContain('***@example.com');
      expect(json.order.snapToken).toBeNull();
      expect(json.order.shippingMobile).toContain('****');
      expect(json.order.shippingAddress).toContain('********');
      expect(res.headers.get('set-cookie')).toBeNull();
    });
  });

  describe('2. POST /api/track-order', () => {
    it('returns 400 when orderId is missing', async () => {
      const req = new Request('http://localhost:3000/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const res = await postTrackOrder(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Nomor Pesanan diperlukan');
    });

    it('returns 404 when order is not found', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: 'ORD-99999' }),
      });

      const res = await postTrackOrder(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toContain('Pesanan tidak ditemukan');
    });

    it('returns 403 when email does not match order email', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'ord-track-1',
        orderId: 'ORD-TRACK-1',
        guestEmail: 'realowner@example.com',
        orderItems: [],
      } as any);

      const req = new Request('http://localhost:3000/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'ORD-TRACK-1',
          email: 'wrongperson@example.com',
        }),
      });

      const res = await postTrackOrder(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('Akses ditolak');
    });

    it('returns 200 with sanitized order details when email matches', async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'ord-track-2',
        orderId: 'ORD-TRACK-2',
        guestEmail: 'buyer@example.com',
        orderStatus: 'IN_DELIVERY',
        paymentStatus: 'PAID',
        paymentAmount: 500000,
        resi: 'JNE-12345678',
        courier: 'JNE Reguler',
        shippingName: 'Pak Buyer',
        shippingMobile: '0812345678',
        shippingCity: 'Surabaya',
        shippingProvince: 'Jawa Timur',
        shippingAddress: 'Jl. Pahlawan No. 1',
        shippingPostalCode: '60174',
        shippingNote: 'Titip di satpam',
        orderItems: [
          {
            id: 'item-1',
            count: 2,
            price: 250000,
            product: { title: 'Madu Randu', slug: 'madu-randu', images: [] },
          },
        ],
      } as any);

      const req = new Request('http://localhost:3000/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'ORD-TRACK-2',
          email: 'buyer@example.com',
        }),
      });

      const res = await postTrackOrder(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.order.resi).toBe('JNE-12345678');
      expect(json.order.orderStatus).toBe('IN_DELIVERY');
      expect(json.order.orderItems).toHaveLength(1);
    });
  });

  describe('3. GET /api/health', () => {
    it('returns 200 with healthy status when checks pass', async () => {
      vi.mocked(performHealthCheck).mockResolvedValue({
        status: 'healthy',
        checks: { database: true, redis: true },
        timestamp: new Date().toISOString(),
      });

      const res = await getHealth();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe('healthy');
      expect(json.checks.database).toBe(true);
    });

    it('returns 503 with unhealthy status when checks fail', async () => {
      vi.mocked(performHealthCheck).mockResolvedValue({
        status: 'unhealthy',
        checks: { database: false, redis: false },
        timestamp: new Date().toISOString(),
      });

      const res = await getHealth();
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.status).toBe('unhealthy');
    });
  });
});
