/**
 * Tests for admin-orders.ts
 * Verifies order fetching and status update functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth-guard
vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ adminId: 'admin-1', role: 'ADMIN' }),
  withAdminAuth: (fn: any) => fn,
}));

describe('Admin Orders Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdminOrders', () => {
    it('should apply correct pagination defaults', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      await getAdminOrders({});

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 15,
          skip: 0,
        })
      );
    });

    it('should clamp page to minimum of 1', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      await getAdminOrders({ page: -5 });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 15,
          skip: 0,
        })
      );
    });

    it('should clamp limit to maximum of 50', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      await getAdminOrders({ limit: 100 });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should filter by paymentStatus when status is PAID', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      await getAdminOrders({ status: 'PAID' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            paymentStatus: 'PAID',
          }),
        })
      );
    });

    it('should filter by orderStatus for non-PAYMENT statuses', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      await getAdminOrders({ status: 'PROCESSING' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderStatus: 'PROCESSING',
          }),
        })
      );
    });

    it('should search by orderId, guestName, and user.name', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

      await getAdminOrders({ search: 'test' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { orderId: { contains: 'test', mode: 'insensitive' } },
              { guestName: { contains: 'test', mode: 'insensitive' } },
              { user: { name: { contains: 'test', mode: 'insensitive' } } },
            ]),
          }),
        })
      );
    });

    it('should return success with nested data and pagination', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      const mockDbOrders = [
        {
          id: '1',
          orderId: 'ORD-1',
          invoiceId: 'INV-1',
          orderStatus: 'PROCESSING',
          paymentStatus: 'PAID',
          guestName: 'John',
          guestEmail: 'john@example.com',
          orderItems: [],
          shippingName: 'John',
          shippingMobile: '0812345678',
          shippingAddress: 'Jl. Merdeka',
          shippingProvince: 'Jawa Barat',
          shippingCity: 'Bandung',
          shippingPostalCode: '40111',
          shippingNote: '',
          createdAt: new Date('2026-08-28T00:00:00Z'),
          resi: '',
          courier: '',
        }
      ];
      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockDbOrders);
      (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(10);

      const result = await getAdminOrders({ page: 2 });

      expect(result.success).toBe(true);
      expect(result.data?.orders).toHaveLength(1);
      expect(result.data?.orders[0].id).toBe('1');
      expect(result.data?.orders[0].customerName).toBe('John');
      expect(result.data?.pagination).toEqual({
        page: 2,
        total: 10,
        totalPages: 1,
        limit: 15
      });
    });

    it('should return error on database failure', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { getAdminOrders } = await import('@/app/actions/admin-orders');

      (prisma.order.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await getAdminOrders({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('updateOrderStatus', () => {
    it('should reject invalid status values', async () => {
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      const result = await updateOrderStatus('order-123', 'INVALID_STATUS');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Status tidak valid');
    });

    it('should accept valid order statuses (IN_DELIVERY requires resi/courier)', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      (prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      // Statuses that don't need resi/courier
      const simpleStatuses = ['WAITING_FOR_PAYMENT', 'PROCESSING', 'PREPARING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
      for (const status of simpleStatuses) {
        const result = await updateOrderStatus('order-123', status);
        expect(result.success).toBe(true);
      }

      // IN_DELIVERY requires resi and courier
      const result = await updateOrderStatus('order-123', 'IN_DELIVERY', '123456', 'JNE');
      expect(result.success).toBe(true);
    });

    it('should require resi and courier for IN_DELIVERY status', async () => {
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      const result = await updateOrderStatus('order-123', 'IN_DELIVERY');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nomor resi dan kurir wajib diisi untuk pesanan dalam pengiriman');
    });

    it('should reject IN_DELIVERY with empty resi', async () => {
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      const result = await updateOrderStatus('order-123', 'IN_DELIVERY', '', 'JNE');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nomor resi dan kurir wajib diisi untuk pesanan dalam pengiriman');
    });

    it('should reject IN_DELIVERY with empty courier', async () => {
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      const result = await updateOrderStatus('order-123', 'IN_DELIVERY', '1234567890', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nomor resi dan kurir wajib diisi untuk pesanan dalam pengiriman');
    });

    it('should update order with correct status', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');
      const { revalidatePath } = await import('next/cache');

      (prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await updateOrderStatus('order-123', 'PROCESSING');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: expect.objectContaining({ orderStatus: 'PROCESSING' }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/admin/orders');
      expect(result.success).toBe(true);
    });

    it('should update order with resi and courier for IN_DELIVERY', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      (prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await updateOrderStatus('order-123', 'IN_DELIVERY', '1234567890', 'JNE');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: expect.objectContaining({
          orderStatus: 'IN_DELIVERY',
          resi: '1234567890',
          courier: 'JNE',
        }),
      });
      expect(result.success).toBe(true);
    });

    it('should return error on database failure', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { updateOrderStatus } = await import('@/app/actions/admin-orders');

      (prisma.order.update as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Order not found')
      );

      const result = await updateOrderStatus('order-123', 'PROCESSING');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order not found');
    });
  });
});
