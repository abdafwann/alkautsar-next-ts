import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveMidtransStatus } from '@/lib/order-transition';

const { mockTx } = vi.hoisted(() => {
  return {
    mockTx: {
      order: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      product: {
        update: vi.fn(),
      },
      cartItem: {
        deleteMany: vi.fn(),
      },
      voucher: {
        update: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb(mockTx)),
  },
}));

describe('Unified Payment & Stock Transition Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveMidtransStatus', () => {
    it('should map capture with accept to PAID & PROCESSING', () => {
      const res = resolveMidtransStatus('capture', 'accept');
      expect(res).toEqual({ targetPaymentStatus: 'PAID', targetOrderStatus: 'PROCESSING' });
    });

    it('should map capture with challenge to UNPAID & WAITING_FOR_PAYMENT', () => {
      const res = resolveMidtransStatus('capture', 'challenge');
      expect(res).toEqual({ targetPaymentStatus: 'UNPAID', targetOrderStatus: 'WAITING_FOR_PAYMENT' });
    });

    it('should map settlement to PAID & PROCESSING', () => {
      const res = resolveMidtransStatus('settlement');
      expect(res).toEqual({ targetPaymentStatus: 'PAID', targetOrderStatus: 'PROCESSING' });
    });

    it('should map cancel, deny, expire to UNPAID & CANCELLED', () => {
      expect(resolveMidtransStatus('cancel')).toEqual({ targetPaymentStatus: 'UNPAID', targetOrderStatus: 'CANCELLED' });
      expect(resolveMidtransStatus('deny')).toEqual({ targetPaymentStatus: 'UNPAID', targetOrderStatus: 'CANCELLED' });
      expect(resolveMidtransStatus('expire')).toEqual({ targetPaymentStatus: 'UNPAID', targetOrderStatus: 'CANCELLED' });
    });

    it('should map pending to UNPAID & WAITING_FOR_PAYMENT', () => {
      const res = resolveMidtransStatus('pending');
      expect(res).toEqual({ targetPaymentStatus: 'UNPAID', targetOrderStatus: 'WAITING_FOR_PAYMENT' });
    });
  });

  describe('processOrderPaymentTransition atomic inventory handling', () => {
    it('should increment sold count and clear cart when transitioning to PAID', async () => {
      mockTx.order.findFirst.mockResolvedValue({
        id: 'ord-uuid-1',
        orderId: 'ORD-100',
        paymentStatus: 'UNPAID',
        orderStatus: 'WAITING_FOR_PAYMENT',
        userId: 'usr-1',
        voucherCode: 'DISKON10',
        orderItems: [{ productId: 'prod-1', count: 2 }],
      });
      mockTx.order.update.mockResolvedValue({
        id: 'ord-uuid-1',
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
      });

      const { processOrderPaymentTransition } = await import('@/lib/order-transition');

      const res = await processOrderPaymentTransition({
        orderId: 'ORD-100',
        targetPaymentStatus: 'PAID',
        targetOrderStatus: 'PROCESSING',
        paymentType: 'qris',
        paymentSettlement: '2026-09-03 10:00:00',
      });

      expect(res.success).toBe(true);
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { sold: { increment: 2 } },
      });
      expect(mockTx.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'usr-1' },
      });
      expect(mockTx.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-uuid-1' },
          data: expect.objectContaining({
            paymentStatus: 'PAID',
            orderStatus: 'PROCESSING',
          }),
        })
      );
    });

    it('should restore inventory stock and rollback voucher when transitioning to CANCELLED', async () => {
      mockTx.order.findFirst.mockResolvedValue({
        id: 'ord-uuid-2',
        orderId: 'ORD-200',
        paymentStatus: 'UNPAID',
        orderStatus: 'WAITING_FOR_PAYMENT',
        userId: 'usr-2',
        voucherCode: 'VOUCHER20',
        orderItems: [{ productId: 'prod-2', count: 3 }],
      });
      mockTx.order.update.mockResolvedValue({
        id: 'ord-uuid-2',
        paymentStatus: 'UNPAID',
        orderStatus: 'CANCELLED',
      });

      const { processOrderPaymentTransition } = await import('@/lib/order-transition');

      const res = await processOrderPaymentTransition({
        orderId: 'ORD-200',
        targetPaymentStatus: 'UNPAID',
        targetOrderStatus: 'CANCELLED',
        cancellationReason: 'Pembayaran kadaluarsa',
      });

      expect(res.success).toBe(true);
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-2' },
        data: { quantity: { increment: 3 } },
      });
      expect(mockTx.voucher.update).toHaveBeenCalledWith({
        where: { code: 'VOUCHER20' },
        data: { usedCount: { decrement: 1 } },
      });
    });
  });
});
