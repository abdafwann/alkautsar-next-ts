'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import midtransClient from 'midtrans-client';
import { sanitizeString } from '@/lib/validation';
import { resolveMidtransStatus, processOrderPaymentTransition } from '@/lib/order-transition';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY_HERE',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY_HERE'
});

export async function cancelOrder(orderId: string, reason: string = 'Dibatalkan oleh pembeli') {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' };

    const cleanOrderId = sanitizeString(orderId).trim();
    const cleanReason = sanitizeString(reason).slice(0, 500) || 'Dibatalkan oleh pembeli';

    const order = await prisma.order.findUnique({
      where: { id: cleanOrderId },
      include: { orderItems: true }
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan' };
    }

    if (order.userId !== session.userId) {
      return { success: false, error: 'Akses ditolak: Anda bukan pemilik pesanan ini' };
    }

    // Cancellation boundary: Only allowed during WAITING_FOR_PAYMENT (Unpaid)
    if (order.orderStatus !== 'WAITING_FOR_PAYMENT' || order.paymentStatus === 'PAID') {
      return {
        success: false,
        error: 'Pesanan yang sudah dibayar atau sedang diproses tidak dapat dibatalkan langsung. Silakan hubungi layanan pelanggan untuk bantuan pengembalian dana.'
      };
    }

    // Transactional cancellation & inventory rollback
    await prisma.$transaction(async (tx) => {
      // 1. Mark order cancelled
      await tx.order.update({
        where: { id: cleanOrderId },
        data: {
          orderStatus: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: cleanReason
        }
      });

      // 2. Restore product stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.count }
          }
        });
      }

      // 3. Rollback voucher usage count if applied
      if (order.voucherCode) {
        await tx.voucher.update({
          where: { code: order.voucherCode },
          data: { usedCount: { decrement: 1 } }
        });
      }
    });

    revalidatePath('/account/orders');
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('cancelOrder error:', error);
    return { success: false, error: error.message || 'Gagal membatalkan pesanan' };
  }
}

export async function syncPaymentStatus(midtransOrderId: string) {
  try {
    const statusResponse = await coreApi.transaction.status(midtransOrderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const { targetPaymentStatus, targetOrderStatus } = resolveMidtransStatus(transactionStatus, fraudStatus);

    await processOrderPaymentTransition({
      orderId: midtransOrderId,
      targetPaymentStatus,
      targetOrderStatus,
      paymentType: statusResponse.payment_type || undefined,
      paymentSettlement: statusResponse.settlement_time || undefined,
      cancellationReason: `Pembayaran ${transactionStatus}`,
    });

    revalidatePath('/account/orders');
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('syncPaymentStatus error:', error);
    return { success: false, error: 'Gagal sinkronisasi status pembayaran' };
  }
}

export async function confirmOrderDelivery(orderId: string, email?: string) {
  try {
    const session = await getSession();
    const cleanOrderId = orderId.trim();
    const cleanEmail = email?.toLowerCase().trim();

    const order = await prisma.order.findUnique({
      where: { orderId: cleanOrderId }
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan' };
    }

    // Check authorization: member matching userId OR guest matching email
    let isAuthorized = false;
    if (session && order.userId && session.userId === order.userId) {
      isAuthorized = true;
    }
    if (!isAuthorized && cleanEmail) {
      const matchGuest = order.guestEmail && order.guestEmail.toLowerCase().trim() === cleanEmail;
      if (matchGuest) isAuthorized = true;
    }

    if (!isAuthorized) {
      return { success: false, error: 'Akses ditolak: Verifikasi email atau login diperlukan' };
    }

    // Can only confirm if IN_DELIVERY or DELIVERED
    if (order.orderStatus !== 'IN_DELIVERY' && order.orderStatus !== 'DELIVERED') {
      return { success: false, error: 'Pesanan belum dalam status pengiriman' };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'COMPLETED',
        deliveredAt: order.deliveredAt || new Date()
      }
    });

    revalidatePath('/account/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/track-order');

    return { success: true };
  } catch (error: any) {
    console.error('confirmOrderDelivery error:', error);
    return { success: false, error: error.message || 'Gagal mengkonfirmasi penerimaan pesanan' };
  }
}

export async function requestOrderComplaint(orderId: string, reason: string, email?: string) {
  try {
    const session = await getSession();
    const cleanOrderId = orderId.trim();
    const cleanEmail = email?.toLowerCase().trim();

    const order = await prisma.order.findUnique({
      where: { orderId: cleanOrderId }
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan' };
    }

    let isAuthorized = false;
    if (session && order.userId && session.userId === order.userId) {
      isAuthorized = true;
    }
    if (!isAuthorized && cleanEmail) {
      const matchGuest = order.guestEmail && order.guestEmail.toLowerCase().trim() === cleanEmail;
      if (matchGuest) isAuthorized = true;
    }

    if (!isAuthorized) {
      return { success: false, error: 'Akses ditolak: Verifikasi email atau login diperlukan' };
    }

    if (order.orderStatus !== 'IN_DELIVERY' && order.orderStatus !== 'DELIVERED') {
      return { success: false, error: 'Komplain hanya dapat diajukan untuk pesanan yang sedang/sudah dikirim' };
    }

    const cleanReason = sanitizeString(reason).slice(0, 500) || 'Pengajuan retur oleh pembeli';

    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'RETURN_REQUESTED',
        cancellationReason: `[KOMPLAIN/RETUR] ${cleanReason}`
      }
    });

    revalidatePath('/account/orders');
    revalidatePath('/admin/orders');
    revalidatePath('/track-order');

    return { success: true };
  } catch (error: any) {
    console.error('requestOrderComplaint error:', error);
    return { success: false, error: error.message || 'Gagal mengajukan komplain pesanan' };
  }
}
