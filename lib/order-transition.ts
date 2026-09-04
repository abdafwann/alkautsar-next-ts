import { prisma } from '@/lib/prisma';

export interface PaymentStatusResolution {
  targetPaymentStatus: 'PAID' | 'UNPAID';
  targetOrderStatus: 'WAITING_FOR_PAYMENT' | 'PROCESSING' | 'CANCELLED';
}

/**
 * Resolves standard Midtrans transaction & fraud statuses to internal domain statuses.
 */
export function resolveMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string | null
): PaymentStatusResolution {
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'challenge') {
      return { targetPaymentStatus: 'UNPAID', targetOrderStatus: 'WAITING_FOR_PAYMENT' };
    }
    if (fraudStatus === 'accept') {
      return { targetPaymentStatus: 'PAID', targetOrderStatus: 'PROCESSING' };
    }
    return { targetPaymentStatus: 'UNPAID', targetOrderStatus: 'WAITING_FOR_PAYMENT' };
  }

  if (transactionStatus === 'settlement') {
    return { targetPaymentStatus: 'PAID', targetOrderStatus: 'PROCESSING' };
  }

  if (
    transactionStatus === 'cancel' ||
    transactionStatus === 'deny' ||
    transactionStatus === 'expire'
  ) {
    return { targetPaymentStatus: 'UNPAID', targetOrderStatus: 'CANCELLED' };
  }

  if (transactionStatus === 'pending') {
    return { targetPaymentStatus: 'UNPAID', targetOrderStatus: 'WAITING_FOR_PAYMENT' };
  }

  return { targetPaymentStatus: 'UNPAID', targetOrderStatus: 'WAITING_FOR_PAYMENT' };
}

export interface TransitionOrderPaymentParams {
  orderId: string; // Accepts Order.orderId or Order.id
  targetPaymentStatus: 'PAID' | 'UNPAID';
  targetOrderStatus: 'WAITING_FOR_PAYMENT' | 'PROCESSING' | 'CANCELLED';
  paymentType?: string | null;
  paymentSettlement?: string | null;
  cancellationReason?: string | null;
}

/**
 * Atomically transitions an order's payment and fulfillment status.
 * Guarantees inventory restore on cancellation and sold counter increment on settlement.
 */
export async function processOrderPaymentTransition({
  orderId,
  targetPaymentStatus,
  targetOrderStatus,
  paymentType,
  paymentSettlement,
  cancellationReason,
}: TransitionOrderPaymentParams) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch order with items and voucher code
    const order = await tx.order.findFirst({
      where: {
        OR: [{ orderId: orderId }, { id: orderId }],
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan' };
    }

    const wasPaid = order.paymentStatus === 'PAID';
    const isBecomingPaid = targetPaymentStatus === 'PAID';
    const isBecomingCancelled = targetOrderStatus === 'CANCELLED';

    // 2. Handle Payment Settlement: Increment product.sold & clear member cart
    if (isBecomingPaid && !wasPaid) {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { sold: { increment: item.count } },
        });
      }

      if (order.userId) {
        await tx.cartItem.deleteMany({
          where: { userId: order.userId },
        });

        try {
          const { redis } = await import('@/lib/redis');
          await redis.del(`cart:${order.userId}`);
        } catch {
          // Redis cache error should not roll back the database transaction
        }
      }
    }

    // 3. Handle Order Cancellation: Restore inventory stock & rollback voucher quota
    if (isBecomingCancelled && order.orderStatus !== 'CANCELLED') {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.count },
            ...(wasPaid ? { sold: { decrement: item.count } } : {}),
          },
        });
      }

      if (order.voucherCode) {
        await tx.voucher.update({
          where: { code: order.voucherCode },
          data: { usedCount: { decrement: 1 } },
        });
      }
    }

    // 4. Update the order record
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: targetPaymentStatus,
        orderStatus: targetOrderStatus,
        ...(paymentType ? { paymentType } : {}),
        ...(paymentSettlement ? { paymentSettlement } : {}),
        ...(isBecomingCancelled
          ? {
              cancelledAt: new Date(),
              cancellationReason:
                cancellationReason || order.cancellationReason || 'Pembayaran dibatalkan atau kadaluarsa',
            }
          : {}),
      },
    });

    return {
      success: true,
      order: updatedOrder,
      wasPaid,
      isBecomingPaid,
      isBecomingCancelled,
    };
  });
}
