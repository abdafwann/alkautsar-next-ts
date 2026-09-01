import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import midtransClient from 'midtrans-client';
import type { OrderStatus, PaymentStatus } from '@prisma/client';

const VALID_ORDER_STATUSES: OrderStatus[] = [
  'WAITING_FOR_PAYMENT',
  'PROCESSING',
  'PREPARING',
  'IN_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED'
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ['UNPAID', 'PAID'];

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    // Verify notification using Midtrans SDK
    const statusResponse = await coreApi.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const transactionId = statusResponse.transaction_id;

    console.log(`Webhook received - Order: ${orderId}, Status: ${transactionStatus}, TransactionId: ${transactionId}`);

    const validMidtransStatuses = ['capture', 'settlement', 'cancel', 'deny', 'expire', 'pending'];
    if (!validMidtransStatuses.includes(transactionStatus)) {
      console.log(`Webhook - Unknown transaction status: ${transactionStatus}`);
      return NextResponse.json({ error: 'Invalid transaction status' }, { status: 400 });
    }

    // Determine target statuses based on transaction status
    let targetPaymentStatus: PaymentStatus = 'UNPAID';
    let targetOrderStatus: OrderStatus = 'WAITING_FOR_PAYMENT';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        targetPaymentStatus = 'UNPAID';
        targetOrderStatus = 'WAITING_FOR_PAYMENT';
      } else if (fraudStatus === 'accept') {
        targetPaymentStatus = 'PAID';
        targetOrderStatus = 'PROCESSING';
      }
    } else if (transactionStatus === 'settlement') {
      targetPaymentStatus = 'PAID';
      targetOrderStatus = 'PROCESSING';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      targetPaymentStatus = 'UNPAID';
      targetOrderStatus = 'CANCELLED';
    } else if (transactionStatus === 'pending') {
      targetPaymentStatus = 'UNPAID';
      targetOrderStatus = 'WAITING_FOR_PAYMENT';
    }

    // Fetch current order state with items
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { orderItems: true }
    });

    if (!order) {
      console.log(`Webhook - Order not found: ${orderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // IDEMPOTENCY CHECK: Skip if already processed with same status
    if (order.paymentStatus === targetPaymentStatus && order.orderStatus === targetOrderStatus) {
      console.log(`Webhook - Already processed, skipping: ${orderId} (${transactionStatus})`);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // If order is already PAID and we receive duplicate settlement, skip
    if (order.paymentStatus === 'PAID' && (transactionStatus === 'settlement' || transactionStatus === 'capture')) {
      console.log(`Webhook - Already paid, skipping duplicate: ${orderId}`);
      return NextResponse.json({ success: true, message: 'Already paid' });
    }

    // If order is CANCELLED, don't reactivate it
    if (order.orderStatus === 'CANCELLED' && targetOrderStatus !== 'CANCELLED') {
      console.log(`Webhook - Order already cancelled, skipping: ${orderId}`);
      return NextResponse.json({ success: true, message: 'Order already cancelled' });
    }

    // If order is already in progress/shipped (PREPARING, IN_DELIVERY, DELIVERED, COMPLETED), do not regress
    const irreversibleStatuses: OrderStatus[] = ['PREPARING', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED'];
    if (irreversibleStatuses.includes(order.orderStatus) && targetOrderStatus === 'PROCESSING') {
      console.log(`Webhook - Order already progressed, skipping status regression: ${orderId}`);
      await prisma.order.update({
        where: { orderId },
        data: {
          paymentStatus: targetPaymentStatus,
          paymentType: statusResponse.payment_type,
          paymentSettlement: statusResponse.settlement_time || statusResponse.payment_time || undefined
        }
      });
      return NextResponse.json({ success: true, message: 'Payment updated, status unchanged' });
    }

    if (!VALID_ORDER_STATUSES.includes(targetOrderStatus) || !VALID_PAYMENT_STATUSES.includes(targetPaymentStatus)) {
      return NextResponse.json({ error: 'Invalid target status' }, { status: 400 });
    }

    // ATOMIC TRANSACTION: State update with Inventory & Sold Counter Management
    await prisma.$transaction(async (tx) => {
      const wasPaid = order.paymentStatus === 'PAID';
      const isBecomingPaid = targetPaymentStatus === 'PAID';
      const isBecomingCancelled = targetOrderStatus === 'CANCELLED';

      // 1. Update order
      await tx.order.update({
        where: { orderId },
        data: {
          paymentStatus: targetPaymentStatus,
          orderStatus: targetOrderStatus,
          paymentType: statusResponse.payment_type,
          paymentSettlement: statusResponse.settlement_time || statusResponse.payment_time || undefined,
          ...(isBecomingCancelled ? { cancelledAt: new Date(), cancellationReason: `Pembayaran ${transactionStatus}` } : {})
        }
      });

      // 2. Handle Payment Settlement: Increment product.sold
      if (isBecomingPaid && !wasPaid) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { sold: { increment: item.count } }
          });
        }
      }

      // 3. Handle Order Cancellation/Expiry: Restore stock & rollback voucher, decrement sold if was paid
      if (isBecomingCancelled && order.orderStatus !== 'CANCELLED') {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.count },
              ...(wasPaid ? { sold: { decrement: item.count } } : {})
            }
          });
        }

        if (order.voucherCode) {
          await tx.voucher.update({
            where: { code: order.voucherCode },
            data: { usedCount: { decrement: 1 } }
          });
        }
      }
    });

    console.log(`Webhook - Successfully processed: ${orderId} -> Payment: ${targetPaymentStatus}, Order: ${targetOrderStatus}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
