'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

function formatNotificationDate(date: Date): string {
  const diffMins = differenceInMinutes(new Date(), date);
  const diffHours = differenceInHours(new Date(), date);
  const diffDays = differenceInDays(new Date(), date);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays <= 3) return `${diffDays} hari yang lalu`;
  
  return format(date, "dd MMM yyyy, HH:mm", { locale: localeId });
}

export type AppNotification = {
  id: string | number;
  type: 'low_stock' | 'order_processing' | 'new_inquiry' | 'grouped_orders' | 'grouped_inquiries';
  title: string;
  message: string;
  customerName?: string;
  isRead: boolean;
  createdAt: string;
  path: string;
};

export async function getDashboardNotifications() {
  try {
    // Restrict access strictly to authorized administrators
    await requireAdmin();

    const notifications: AppNotification[] = [];

    // Parallelize queries across low stock, pending orders, and unread inquiries
    const [lowStockProducts, processingOrders, unreadInquiries] = await Promise.all([
      prisma.product.findMany({
        where: { quantity: { lte: 5 } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, quantity: true, updatedAt: true }
      }),
      prisma.order.findMany({
        where: { orderStatus: 'PROCESSING' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, invoiceId: true, user: { select: { name: true } }, guestName: true, createdAt: true }
      }),
      prisma.inquiry.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, subject: true, createdAt: true }
      })
    ]);

    // 1. Low Stock Alerts
    if (lowStockProducts.length > 0) {
      notifications.push({
        id: 'ls_grouped',
        type: 'low_stock',
        title: 'Stok Kritis!',
        message: `Ada ${lowStockProducts.length} produk yang stoknya menipis (≤ 5).`,
        isRead: false,
        createdAt: formatNotificationDate(new Date(lowStockProducts[0].updatedAt)),
        path: '/admin/products?filterStock=LOW'
      });
    }

    // 2. Orders Processing Alerts
    if (processingOrders.length > 0) {
      if (processingOrders.length <= 3) {
        processingOrders.forEach(order => {
          notifications.push({
            id: `ord_${order.id}`,
            type: 'order_processing',
            title: 'Pesanan Perlu Diproses',
            message: `Pesanan ${order.invoiceId || 'baru'} menunggu untuk diproses.`,
            customerName: order.user?.name || order.guestName || 'Pelanggan',
            isRead: false,
            createdAt: formatNotificationDate(new Date(order.createdAt)),
            path: '/admin/orders'
          });
        });
      } else {
        notifications.push({
          id: 'ord_grouped',
          type: 'grouped_orders',
          title: 'Pesanan Menumpuk',
          message: `Terdapat ${processingOrders.length} pesanan baru yang menunggu untuk diproses.`,
          isRead: false,
          createdAt: formatNotificationDate(new Date(processingOrders[0].createdAt)),
          path: '/admin/orders'
        });
      }
    }

    // 3. Unread Inquiries Alerts
    if (unreadInquiries.length > 0) {
      if (unreadInquiries.length <= 3) {
        unreadInquiries.forEach(inq => {
          notifications.push({
            id: `inq_${inq.id}`,
            type: 'new_inquiry',
            title: 'Pesan Masuk',
            message: inq.subject ? `Pesan: ${inq.subject}` : 'Pesan baru dari pelanggan.',
            customerName: inq.name,
            isRead: false,
            createdAt: formatNotificationDate(new Date(inq.createdAt)),
            path: '/admin/inquiries'
          });
        });
      } else {
        notifications.push({
          id: 'inq_grouped',
          type: 'grouped_inquiries',
          title: 'Pesan Belum Dibaca',
          message: `Terdapat ${unreadInquiries.length} pesan pelanggan yang belum dibaca.`,
          isRead: false,
          createdAt: formatNotificationDate(new Date(unreadInquiries[0].createdAt)),
          path: '/admin/inquiries'
        });
      }
    }

    return { success: true, data: notifications };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message || 'Gagal memuat notifikasi' };
  }
}
