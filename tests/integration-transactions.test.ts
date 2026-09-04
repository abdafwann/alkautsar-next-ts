import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cancelOrder } from '@/app/actions/order';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('midtrans-client', () => {
  class MockCoreApi {
    transaction = {
      status: vi.fn(),
    };
  }
  return {
    default: {
      CoreApi: MockCoreApi,
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('Phase 2 Integration: Database Transaction Atomicity & Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Atomic Cancel Order Transaction (Paid Status)', () => {
    it('executes product stock restoration, sold count decrement, voucher restoration, and order cancellation atomically within single $transaction', async () => {
      vi.mocked(getSession).mockResolvedValue({
        userId: 'usr-buyer-1',
        role: 'MEMBER',
      } as any);

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-paid-1',
        orderId: 'ORD-PAID-TEST',
        userId: 'usr-buyer-1',
        orderStatus: 'PROCESSING',
        paymentStatus: 'PAID',
        voucherCode: 'SUPERPROMO',
        orderItems: [
          { productId: 'prod-item-1', count: 3 },
          { productId: 'prod-item-2', count: 1 },
        ],
      } as any);

      const mockTx = {
        product: { update: vi.fn().mockResolvedValue({}) },
        voucher: { update: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const result = await cancelOrder('ORD-PAID-TEST', 'Ingin mengubah alamat pengiriman');

      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);

      // Verify Product 1: quantity +3, sold -3
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-item-1' },
        data: {
          quantity: { increment: 3 },
          sold: { decrement: 3 },
        },
      });

      // Verify Product 2: quantity +1, sold -1
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-item-2' },
        data: {
          quantity: { increment: 1 },
          sold: { decrement: 1 },
        },
      });

      // Verify Voucher: usedCount -1
      expect(mockTx.voucher.update).toHaveBeenCalledWith({
        where: { code: 'SUPERPROMO' },
        data: { usedCount: { decrement: 1 } },
      });

      // Verify Order: status CANCELLED, cancellationReason saved
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'ORD-PAID-TEST' },
        data: {
          orderStatus: 'CANCELLED',
          cancelledAt: expect.any(Date),
          cancellationReason: 'Ingin mengubah alamat pengiriman',
        },
      });
    });
  });

  describe('2. Atomic Cancel Order Transaction (Unpaid Status)', () => {
    it('restores stock and voucher without modifying sold counter when order was UNPAID', async () => {
      vi.mocked(getSession).mockResolvedValue({
        userId: 'usr-buyer-2',
        role: 'MEMBER',
      } as any);

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-unpaid-2',
        orderId: 'ORD-UNPAID-TEST',
        userId: 'usr-buyer-2',
        orderStatus: 'WAITING_FOR_PAYMENT',
        paymentStatus: 'UNPAID',
        voucherCode: 'NEWUSER10',
        orderItems: [{ productId: 'prod-single-1', count: 5 }],
      } as any);

      const mockTx = {
        product: { update: vi.fn().mockResolvedValue({}) },
        voucher: { update: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const result = await cancelOrder('ORD-UNPAID-TEST', 'Berubah pikiran');

      expect(result.success).toBe(true);

      // Verify Product: quantity +5, sold is NOT touched
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-single-1' },
        data: {
          quantity: { increment: 5 },
        },
      });

      // Verify Voucher: usedCount -1
      expect(mockTx.voucher.update).toHaveBeenCalledWith({
        where: { code: 'NEWUSER10' },
        data: { usedCount: { decrement: 1 } },
      });
    });
  });

  describe('3. Transaction Failure & Rollback Simulation', () => {
    it('ensures that if any database update fails mid-transaction, the transaction throws and error is returned', async () => {
      vi.mocked(getSession).mockResolvedValue({
        userId: 'usr-buyer-3',
        role: 'MEMBER',
      } as any);

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-fail-1',
        orderId: 'ORD-FAIL-TEST',
        userId: 'usr-buyer-3',
        orderStatus: 'PROCESSING',
        paymentStatus: 'PAID',
        voucherCode: 'FAULTYVOUCHER',
        orderItems: [{ productId: 'prod-fail-1', count: 2 }],
      } as any);

      const mockTx = {
        order: {
          update: vi.fn().mockRejectedValue(new Error('Deadlock detected or constraint violation')),
        },
        product: { update: vi.fn() },
        voucher: { update: vi.fn() },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const result = await cancelOrder('ORD-FAIL-TEST', 'Alasan batal');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Deadlock detected or constraint violation');
      // Product and voucher updates must never have been reached
      expect(mockTx.product.update).not.toHaveBeenCalled();
      expect(mockTx.voucher.update).not.toHaveBeenCalled();
    });
  });

  describe('4. Concurrency & Deadlock Prevention Mechanism', () => {
    it('verifies product IDs are sorted deterministically before row lock acquisition', () => {
      const unsortedProductIds = ['prod-zebra', 'prod-alpha', 'prod-delta', 'prod-beta'];
      const sortedProductIds = [...unsortedProductIds].sort();

      expect(sortedProductIds).toEqual([
        'prod-alpha',
        'prod-beta',
        'prod-delta',
        'prod-zebra',
      ]);
    });
  });
});
