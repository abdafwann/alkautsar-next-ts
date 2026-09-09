import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    product: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    voucher: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === 'function') {
        return callback({
          $queryRaw: vi.fn(),
          order: { update: vi.fn(), create: vi.fn() },
          product: { update: vi.fn() },
          voucher: { update: vi.fn() }
        });
      }
      return Promise.resolve(callback);
    })
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ adminId: 'admin-1', role: 'ADMIN' }),
  withAdminAuth: (fn: any) => fn,
}));

describe('Redesigned Orders Flow & Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateOrderStatus Status Validations', () => {
    it('should accept all valid redesigned statuses including PREPARING, RETURN_REQUESTED, RETURNED', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      (prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const validStatuses = [
        'WAITING_FOR_PAYMENT',
        'PROCESSING',
        'PREPARING',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'RETURN_REQUESTED',
        'RETURNED'
      ];

      for (const status of validStatuses) {
        const result = await updateOrderStatus('order-123', status);
        expect(result.success).toBe(true);
      }
    });

    it('should require resi and courier when status is IN_DELIVERY', async () => {
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      // Without resi/courier
      const failResult = await updateOrderStatus('order-123', 'IN_DELIVERY');
      expect(failResult.success).toBe(false);
      expect(failResult.error).toContain('Nomor resi dan kurir wajib diisi');

      // With resi/courier
      const { prisma } = await import('@/lib/prisma');
      (prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
      const successResult = await updateOrderStatus('order-123', 'IN_DELIVERY', 'JNE123456', 'JNE');
      expect(successResult.success).toBe(true);
    });
  });

  describe('cancelOrder Boundary Rules', () => {
    it('should reject cancellation if user is not authenticated', async () => {
      const { getSession } = await import('@/lib/session');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await cancelOrder('order-123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should allow cancellation when status is WAITING_FOR_PAYMENT and unpaid', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });

      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'order-123',
        userId: 'user-1',
        orderStatus: 'WAITING_FOR_PAYMENT',
        paymentStatus: 'UNPAID',
        orderItems: [{ productId: 'prod-1', count: 2 }],
        voucherCode: null
      });

      const result = await cancelOrder('order-123');
      expect(result.success).toBe(true);
    });

    it('should block cancellation when status is paid or already processing/in delivery/completed', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });

      const blockedStatuses = ['PROCESSING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED'];

      for (const status of blockedStatuses) {
        (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
          id: 'order-123',
          userId: 'user-1',
          orderStatus: status,
          paymentStatus: 'PAID',
          orderItems: [{ productId: 'prod-1', count: 1 }],
          voucherCode: null
        });

        const result = await cancelOrder('order-123');
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/tidak dapat dibatalkan langsung|hubungi/i);
      }
    });
  });

  describe('requestOrderComplaint Persistence', () => {
    it('should save cancellationReason with [KOMPLAIN/RETUR] prefix and update orderStatus', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { requestOrderComplaint } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });

      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'db-order-uuid',
        orderId: 'ORD-12345',
        userId: 'user-1',
        orderStatus: 'DELIVERED',
        guestEmail: null,
      });

      const result = await requestOrderComplaint('ORD-12345', 'Barang pecah saat pengiriman');

      expect(result.success).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'db-order-uuid' },
        data: {
          orderStatus: 'RETURN_REQUESTED',
          cancellationReason: '[KOMPLAIN/RETUR] Barang pecah saat pengiriman'
        }
      });
    });
  });
});
