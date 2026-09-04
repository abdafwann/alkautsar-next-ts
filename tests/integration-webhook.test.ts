import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhook/midtrans/route';
import { prisma } from '@/lib/prisma';
import { processOrderPaymentTransition } from '@/lib/order-transition';

// Hoisted mocks for midtrans-client & order-transition
const { mockNotification } = vi.hoisted(() => ({
  mockNotification: vi.fn(),
}));

vi.mock('midtrans-client', () => {
  class MockCoreApi {
    transaction = {
      notification: mockNotification,
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
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/order-transition', () => ({
  processOrderPaymentTransition: vi.fn(),
  resolveMidtransStatus: vi.fn((status: string, fraud: string) => {
    if (status === 'settlement' || (status === 'capture' && fraud === 'accept')) {
      return { targetPaymentStatus: 'PAID', targetOrderStatus: 'PROCESSING' };
    }
    if (status === 'cancel' || status === 'deny' || status === 'expire') {
      return { targetPaymentStatus: 'UNPAID', targetOrderStatus: 'CANCELLED' };
    }
    return { targetPaymentStatus: 'UNPAID', targetOrderStatus: 'WAITING_FOR_PAYMENT' };
  }),
}));

describe('Phase 2 Integration: Midtrans Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(body: Record<string, any>) {
    return new Request('http://localhost:3000/api/webhook/midtrans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  describe('1. Valid Status Transitions', () => {
    it('processes settlement -> PAID & PROCESSING with atomic transition', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-SETTLE-1',
        transaction_status: 'settlement',
        transaction_id: 'mid-tx-123',
        payment_type: 'bank_transfer',
        settlement_time: '2026-09-04 10:00:00',
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-1',
        orderId: 'ORD-SETTLE-1',
        paymentStatus: 'UNPAID',
        orderStatus: 'WAITING_FOR_PAYMENT',
        orderItems: [{ id: 'item-1', productId: 'p-1', count: 1 }],
      } as any);

      vi.mocked(processOrderPaymentTransition).mockResolvedValue({ success: true });

      const req = createMockRequest({ order_id: 'ORD-SETTLE-1' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(processOrderPaymentTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ORD-SETTLE-1',
          targetPaymentStatus: 'PAID',
          targetOrderStatus: 'PROCESSING',
          paymentType: 'bank_transfer',
          paymentSettlement: '2026-09-04 10:00:00',
          cancellationReason: 'Pembayaran settlement',
        })
      );
    });

    it('processes capture with fraud_status accept -> PAID & PROCESSING', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-CAP-1',
        transaction_status: 'capture',
        fraud_status: 'accept',
        transaction_id: 'mid-tx-456',
        payment_type: 'credit_card',
        payment_time: '2026-09-04 10:05:00',
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-2',
        orderId: 'ORD-CAP-1',
        paymentStatus: 'UNPAID',
        orderStatus: 'WAITING_FOR_PAYMENT',
        orderItems: [],
      } as any);

      vi.mocked(processOrderPaymentTransition).mockResolvedValue({ success: true });

      const req = createMockRequest({ order_id: 'ORD-CAP-1' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(processOrderPaymentTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ORD-CAP-1',
          targetPaymentStatus: 'PAID',
          targetOrderStatus: 'PROCESSING',
        })
      );
    });

    it('processes capture with fraud_status challenge -> UNPAID & WAITING_FOR_PAYMENT', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-CHALLENGE-1',
        transaction_status: 'capture',
        fraud_status: 'challenge',
        transaction_id: 'mid-tx-789',
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-3',
        orderId: 'ORD-CHALLENGE-1',
        paymentStatus: 'UNPAID',
        orderStatus: 'PROCESSING', // Different from target to trigger transition
        orderItems: [],
      } as any);

      vi.mocked(processOrderPaymentTransition).mockResolvedValue({ success: true });

      const req = createMockRequest({ order_id: 'ORD-CHALLENGE-1' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(processOrderPaymentTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ORD-CHALLENGE-1',
          targetPaymentStatus: 'UNPAID',
          targetOrderStatus: 'WAITING_FOR_PAYMENT',
        })
      );
    });

    it('processes cancel, deny, or expire -> UNPAID & CANCELLED with rollback trigger', async () => {
      const statuses = ['cancel', 'deny', 'expire'];

      for (const status of statuses) {
        mockNotification.mockResolvedValue({
          order_id: `ORD-${status.toUpperCase()}`,
          transaction_status: status,
          transaction_id: `mid-tx-${status}`,
        });

        vi.mocked(prisma.order.findUnique).mockResolvedValue({
          id: `db-ord-${status}`,
          orderId: `ORD-${status.toUpperCase()}`,
          paymentStatus: 'UNPAID',
          orderStatus: 'WAITING_FOR_PAYMENT',
          orderItems: [{ id: 'item-1', productId: 'p-1', count: 2 }],
        } as any);

        vi.mocked(processOrderPaymentTransition).mockResolvedValue({ success: true });

        const req = createMockRequest({ order_id: `ORD-${status.toUpperCase()}` });
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(processOrderPaymentTransition).toHaveBeenCalledWith(
          expect.objectContaining({
            orderId: `ORD-${status.toUpperCase()}`,
            targetPaymentStatus: 'UNPAID',
            targetOrderStatus: 'CANCELLED',
            cancellationReason: `Pembayaran ${status}`,
          })
        );
      }
    });
  });

  describe('2. Idempotency & Conflict Prevention', () => {
    it('skips duplicate notification if order already has targetPaymentStatus & targetOrderStatus', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-IDEMPOTENT-1',
        transaction_status: 'settlement',
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-dup',
        orderId: 'ORD-IDEMPOTENT-1',
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
      } as any);

      const req = createMockRequest({ order_id: 'ORD-IDEMPOTENT-1' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.message).toBe('Already processed');
      expect(processOrderPaymentTransition).not.toHaveBeenCalled();
    });

    it('skips duplicate settlement/capture if order is already PAID', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-PAID-ALREADY',
        transaction_status: 'settlement',
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-paid',
        orderId: 'ORD-PAID-ALREADY',
        paymentStatus: 'PAID',
        orderStatus: 'PREPARING', // Already moved forward
      } as any);

      const req = createMockRequest({ order_id: 'ORD-PAID-ALREADY' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.message).toBe('Already paid');
      expect(processOrderPaymentTransition).not.toHaveBeenCalled();
    });

    it('does not reactivate or modify an order that is already CANCELLED', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-ALREADY-CANCELLED',
        transaction_status: 'settlement',
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: 'db-ord-cancelled',
        orderId: 'ORD-ALREADY-CANCELLED',
        paymentStatus: 'UNPAID',
        orderStatus: 'CANCELLED',
      } as any);

      const req = createMockRequest({ order_id: 'ORD-ALREADY-CANCELLED' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.message).toBe('Order already cancelled');
      expect(processOrderPaymentTransition).not.toHaveBeenCalled();
    });

    it('prevents order status regression if order is already in PREPARING/IN_DELIVERY/DELIVERED/COMPLETED', async () => {
      const progressiveStatuses = ['PREPARING', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED'];

      for (const status of progressiveStatuses) {
        mockNotification.mockResolvedValue({
          order_id: `ORD-PROG-${status}`,
          transaction_status: 'settlement',
          payment_type: 'gopay',
          settlement_time: '2026-09-04 12:00:00',
        });

        vi.mocked(prisma.order.findUnique).mockResolvedValue({
          id: `db-ord-${status}`,
          orderId: `ORD-PROG-${status}`,
          paymentStatus: 'UNPAID',
          orderStatus: status,
        } as any);

        const req = createMockRequest({ order_id: `ORD-PROG-${status}` });
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.message).toBe('Payment updated, status unchanged');
        expect(prisma.order.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { orderId: `ORD-PROG-${status}` },
            data: expect.objectContaining({
              paymentStatus: 'PAID',
              paymentType: 'gopay',
            }),
          })
        );
        expect(processOrderPaymentTransition).not.toHaveBeenCalled();
      }
    });
  });

  describe('3. Error Handling & Guard Boundaries', () => {
    it('returns 400 for unknown/invalid Midtrans transaction_status', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-UNKNOWN',
        transaction_status: 'unrecognized_status',
      });

      const req = createMockRequest({ order_id: 'ORD-UNKNOWN' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Invalid transaction status');
    });

    it('returns 404 when order does not exist in database', async () => {
      mockNotification.mockResolvedValue({
        order_id: 'ORD-NOT-FOUND',
        transaction_status: 'settlement',
      });

      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      const req = createMockRequest({ order_id: 'ORD-NOT-FOUND' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toBe('Order not found');
    });

    it('returns 500 when notification verification fails or throws an exception', async () => {
      mockNotification.mockRejectedValue(new Error('Midtrans API connection timeout'));

      const req = createMockRequest({ order_id: 'ORD-ERR' });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe('Internal Server Error');
    });
  });
});
