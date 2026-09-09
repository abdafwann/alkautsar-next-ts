import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhook/midtrans/verify/route';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { requireAdmin } from '@/lib/auth-guard';
import { cookies } from 'next/headers';
import { createOrderClaimToken } from '@/lib/order-security';
import { paymentSyncLimiter } from '@/lib/ratelimit';
import { syncPaymentStatus } from '@/app/actions/order';

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

vi.mock('@/lib/ratelimit', () => ({
  paymentSyncLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock('@/app/actions/order', () => ({
  syncPaymentStatus: vi.fn(),
}));

describe('Integration: Midtrans Payment Verify API (app/api/webhook/midtrans/verify/route.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    mockCookieStore.get.mockReturnValue(undefined);
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Unauthorized'));
    vi.mocked(paymentSyncLimiter.limit).mockResolvedValue({ success: true } as any);
    vi.mocked(syncPaymentStatus).mockResolvedValue({ success: true });
  });

  function createRequest(body: any, ip = '127.0.0.1') {
    return new Request('http://localhost:3000/api/webhook/midtrans/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify(body),
    });
  }

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(paymentSyncLimiter.limit).mockResolvedValue({ success: false } as any);

    const req = createRequest({ orderId: 'ORD-123' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toContain('Terlalu banyak permintaan');
  });

  it('returns 400 when orderId is missing', async () => {
    const req = createRequest({});
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Order ID is required');
  });

  it('returns 404 when order is not found in database', async () => {
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

    const req = createRequest({ orderId: 'ORD-NOT-FOUND' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe('Pesanan tidak ditemukan');
  });

  it('returns 403 when unauthenticated/unauthorized caller attempts verification', async () => {
    vi.mocked(prisma.order.findFirst).mockResolvedValue({
      id: 'db-ord-1',
      orderId: 'ORD-SECURE-1',
      userId: 'user-owner-1',
    } as any);

    const req = createRequest({ orderId: 'ORD-SECURE-1' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toContain('Akses ditolak');
  });

  it('allows synchronization for authenticated member owner', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: 'user-owner-1' } as any);
    vi.mocked(prisma.order.findFirst).mockResolvedValue({
      id: 'db-ord-1',
      orderId: 'ORD-SECURE-1',
      userId: 'user-owner-1',
    } as any);

    const req = createRequest({ orderId: 'ORD-SECURE-1' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(syncPaymentStatus).toHaveBeenCalledWith('ORD-SECURE-1');
  });

  it('allows synchronization for guest with valid claim token cookie', async () => {
    const token = await createOrderClaimToken('ORD-GUEST-99', 'guest@example.com');
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === 'order_claim_ORD-GUEST-99') return { value: token };
      return undefined;
    });

    vi.mocked(prisma.order.findFirst).mockResolvedValue({
      id: 'db-ord-guest',
      orderId: 'ORD-GUEST-99',
      userId: null,
      guestEmail: 'guest@example.com',
    } as any);

    const req = createRequest({ orderId: 'ORD-GUEST-99' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(syncPaymentStatus).toHaveBeenCalledWith('ORD-GUEST-99');
  });
});
