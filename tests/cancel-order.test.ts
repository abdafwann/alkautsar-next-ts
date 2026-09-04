import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      update: vi.fn(),
    },
    voucher: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === 'function') {
        const txMock = {
          order: { update: vi.fn() },
          product: { update: vi.fn() },
          voucher: { update: vi.fn() },
        };
        return callback(txMock);
      }
      return Promise.resolve(callback);
    }),
  },
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/validation', () => ({
  sanitizeString: vi.fn((s: string) => s),
}));

vi.mock('@/lib/order-transition', () => ({
  resolveMidtransStatus: vi.fn(),
  processOrderPaymentTransition: vi.fn(),
}));

vi.mock('midtrans-client', () => {
  class MockCoreApi {
    constructor() {}
    transaction = { status: vi.fn() };
  }
  return { default: { CoreApi: MockCoreApi } };
});

// ─── Test Data ───────────────────────────────────────────────────
const MOCK_USER_ID = 'user-123';
const MOCK_ORDER_ID = 'order-456';

const createMockOrder = (overrides: Record<string, any> = {}) => ({
  id: MOCK_ORDER_ID,
  userId: MOCK_USER_ID,
  orderStatus: 'WAITING_FOR_PAYMENT',
  paymentStatus: 'UNPAID',
  voucherCode: null,
  orderItems: [
    { id: 'item-1', productId: 'prod-1', count: 2 },
    { id: 'item-2', productId: 'prod-2', count: 1 },
  ],
  ...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────
describe('cancelOrder Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Auth Guard ──────────────────────────────────────────────
  describe('Authentication & Authorization', () => {
    it('should reject if user is not logged in', async () => {
      const { getSession } = await import('@/lib/session');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await cancelOrder(MOCK_ORDER_ID);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it('should reject if order does not exist', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await cancelOrder('nonexistent-order');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak ditemukan/i);
    });

    it('should reject if user is not the order owner', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'different-user' });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockOrder({ userId: MOCK_USER_ID })
      );

      const result = await cancelOrder(MOCK_ORDER_ID);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/akses ditolak/i);
    });
  });

  // ── Status Boundary ─────────────────────────────────────────
  describe('Cancellation Status Boundary', () => {
    const cancellableStatuses = ['WAITING_FOR_PAYMENT', 'PROCESSING', 'PREPARING'];
    const nonCancellableStatuses = ['IN_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED'];

    it.each(cancellableStatuses)(
      'should allow cancellation for status: %s',
      async (status) => {
        const { getSession } = await import('@/lib/session');
        const { prisma } = await import('@/lib/prisma');
        const { cancelOrder } = await import('@/app/actions/order');

        (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
        (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
          createMockOrder({ orderStatus: status })
        );

        const result = await cancelOrder(MOCK_ORDER_ID);
        expect(result.success).toBe(true);
      }
    );

    it.each(nonCancellableStatuses)(
      'should reject cancellation for status: %s',
      async (status) => {
        const { getSession } = await import('@/lib/session');
        const { prisma } = await import('@/lib/prisma');
        const { cancelOrder } = await import('@/app/actions/order');

        (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
        (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
          createMockOrder({ orderStatus: status })
        );

        const result = await cancelOrder(MOCK_ORDER_ID);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/tidak dapat dibatalkan/i);
      }
    );
  });

  // ── Transaction Rollback ────────────────────────────────────
  describe('Transaction: Stock & Voucher Rollback', () => {
    it('should increment stock for each order item during cancellation', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(createMockOrder());

      let txProductUpdateCalls: any[] = [];
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (cb) => {
        const txMock = {
          order: { update: vi.fn() },
          product: { update: vi.fn((...args: any[]) => txProductUpdateCalls.push(args)) },
          voucher: { update: vi.fn() },
        };
        return cb(txMock);
      });

      await cancelOrder(MOCK_ORDER_ID);

      // Should call product.update for each order item (2 items)
      expect(txProductUpdateCalls).toHaveLength(2);
      expect(txProductUpdateCalls[0][0].data.quantity).toEqual({ increment: 2 });
      expect(txProductUpdateCalls[1][0].data.quantity).toEqual({ increment: 1 });
    });

    it('should decrement sold count only when order was paid', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockOrder({ paymentStatus: 'PAID', orderStatus: 'PROCESSING' })
      );

      let txProductUpdateCalls: any[] = [];
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (cb) => {
        const txMock = {
          order: { update: vi.fn() },
          product: { update: vi.fn((...args: any[]) => txProductUpdateCalls.push(args)) },
          voucher: { update: vi.fn() },
        };
        return cb(txMock);
      });

      await cancelOrder(MOCK_ORDER_ID);

      // Paid order: sold should be decremented
      expect(txProductUpdateCalls[0][0].data.sold).toEqual({ decrement: 2 });
      expect(txProductUpdateCalls[1][0].data.sold).toEqual({ decrement: 1 });
    });

    it('should NOT decrement sold count when order was unpaid', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockOrder({ paymentStatus: 'UNPAID', orderStatus: 'WAITING_FOR_PAYMENT' })
      );

      let txProductUpdateCalls: any[] = [];
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (cb) => {
        const txMock = {
          order: { update: vi.fn() },
          product: { update: vi.fn((...args: any[]) => txProductUpdateCalls.push(args)) },
          voucher: { update: vi.fn() },
        };
        return cb(txMock);
      });

      await cancelOrder(MOCK_ORDER_ID);

      // Unpaid order: sold should NOT be in the update data
      expect(txProductUpdateCalls[0][0].data.sold).toBeUndefined();
    });

    it('should decrement voucher usedCount when order had a voucher', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockOrder({ voucherCode: 'DISKON10' })
      );

      let txVoucherUpdateCalls: any[] = [];
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (cb) => {
        const txMock = {
          order: { update: vi.fn() },
          product: { update: vi.fn() },
          voucher: { update: vi.fn((...args: any[]) => txVoucherUpdateCalls.push(args)) },
        };
        return cb(txMock);
      });

      await cancelOrder(MOCK_ORDER_ID);

      expect(txVoucherUpdateCalls).toHaveLength(1);
      expect(txVoucherUpdateCalls[0][0].where.code).toBe('DISKON10');
      expect(txVoucherUpdateCalls[0][0].data.usedCount).toEqual({ decrement: 1 });
    });

    it('should NOT touch voucher when order had no voucher', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockOrder({ voucherCode: null })
      );

      let txVoucherUpdateCalls: any[] = [];
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (cb) => {
        const txMock = {
          order: { update: vi.fn() },
          product: { update: vi.fn() },
          voucher: { update: vi.fn((...args: any[]) => txVoucherUpdateCalls.push(args)) },
        };
        return cb(txMock);
      });

      await cancelOrder(MOCK_ORDER_ID);

      expect(txVoucherUpdateCalls).toHaveLength(0);
    });
  });

  // ── Reason Passthrough ──────────────────────────────────────
  describe('Cancellation Reason', () => {
    it('should store the provided reason in the order update', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(createMockOrder());

      let txOrderUpdateData: any = null;
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (cb) => {
        const txMock = {
          order: { update: vi.fn((args: any) => { txOrderUpdateData = args.data; }) },
          product: { update: vi.fn() },
          voucher: { update: vi.fn() },
        };
        return cb(txMock);
      });

      await cancelOrder(MOCK_ORDER_ID, 'Ingin mengubah pesanan / alamat pengiriman');

      expect(txOrderUpdateData.cancellationReason).toBe('Ingin mengubah pesanan / alamat pengiriman');
      expect(txOrderUpdateData.orderStatus).toBe('CANCELLED');
      expect(txOrderUpdateData.cancelledAt).toBeInstanceOf(Date);
    });

    it('should use default reason when none is provided', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(createMockOrder());

      let txOrderUpdateData: any = null;
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (cb) => {
        const txMock = {
          order: { update: vi.fn((args: any) => { txOrderUpdateData = args.data; }) },
          product: { update: vi.fn() },
          voucher: { update: vi.fn() },
        };
        return cb(txMock);
      });

      await cancelOrder(MOCK_ORDER_ID);

      expect(txOrderUpdateData.cancellationReason).toBe('Dibatalkan oleh pembeli');
    });
  });

  // ── Revalidation ────────────────────────────────────────────
  describe('Cache Revalidation', () => {
    it('should revalidate /account/orders and /admin/orders after successful cancellation', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { revalidatePath } = await import('next/cache');
      const { cancelOrder } = await import('@/app/actions/order');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.order.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(createMockOrder());

      await cancelOrder(MOCK_ORDER_ID);

      expect(revalidatePath).toHaveBeenCalledWith('/account/orders');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/orders');
    });
  });
});
