'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { recordAdminLog } from './admin-logs';

interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function getAdminOrders(filters: OrderFilters = {}) {
  try {
    await requireAdmin();
    const page = Math.max(1, filters.page || 1);
    const take = Math.min(50, Math.max(1, filters.limit || 15));
    const skip = (page - 1) * take;
    const where: Record<string, unknown> = {};

    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'PAID') where.paymentStatus = filters.status;
      else where.orderStatus = filters.status;
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      where.OR = [
        { orderId: { contains: s, mode: 'insensitive' } },
        { guestName: { contains: s, mode: 'insensitive' } },
        { user: { name: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          user: { select: { name: true, email: true } },
          orderItems: {
            include: {
              product: {
                select: {
                  title: true,
                  images: { take: 1, select: { url: true } }
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where }),
    ]);

    // Serialize to match expected Order interface
    const serializedOrders = orders.map(order => {
      const orderItems = order.orderItems || [];
      const subtotal = orderItems.reduce((sum, item) => {
        return sum + (Number(item.price) * item.count);
      }, 0);
      const discount = order.discountAmount ? Number(order.discountAmount) : 0;
      const shippingCost = 0; // Would need to be stored in order

      return {
        id: order.id,
        orderId: order.orderId,
        invoiceId: order.invoiceId,
        customerName: order.guestName || order.user?.name || null,
        customerEmail: order.guestEmail || order.user?.email || null,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentType: order.paymentType || null,
        voucherCode: order.voucherCode || null,
        discountAmount: discount,
        subtotal,
        total: subtotal + shippingCost - discount,
        createdAt: order.createdAt,
        resi: order.resi,
        courier: order.courier,
        cancellationReason: order.cancellationReason || null,
        items: orderItems.map(item => ({
          id: item.id,
          name: item.product?.title || 'Produk Herbal',
          count: item.count,
          price: Number(item.price),
          imageUrl: item.product?.images?.[0]?.url || null,
        })),
        shipping: {
          name: order.shippingName,
          mobile: order.shippingMobile,
          address: order.shippingAddress,
          province: order.shippingProvince,
          city: order.shippingCity,
          postalCode: order.shippingPostalCode,
          note: order.shippingNote,
        },
      };
    });

    const totalPages = Math.ceil(total / take);

    return {
      success: true,
      data: {
        orders: serializedOrders,
        pagination: { page, total, totalPages, limit: take }
      }
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateOrderStatus(
  id: string,
  statusOrData: string | { status: string; resi?: string; courier?: string },
  resiArg?: string,
  courierArg?: string
) {
  try {
    const admin = await requireAdmin();

    const status = typeof statusOrData === 'string' ? statusOrData : statusOrData?.status;
    const resi = typeof statusOrData === 'object' ? statusOrData?.resi : resiArg;
    const courier = typeof statusOrData === 'object' ? statusOrData?.courier : courierArg;

    const VALID = [
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
    if (!status || !VALID.includes(status)) return { success: false, error: 'Status tidak valid' };

    if (status === 'IN_DELIVERY' && (!resi?.trim() || !courier?.trim())) {
      return { success: false, error: 'Nomor resi dan kurir wajib diisi untuk pesanan dalam pengiriman' };
    }

    const updateData: Record<string, unknown> = { orderStatus: status };

    /*
     * Kurir dan resi hanya valid di-assign saat paket telah diserahkan ke kurir (IN_DELIVERY, dsb).
     * Saat status masih dalam tahap pengemasan (PREPARING) atau sebelumnya, kolom ini wajib tetap kosong (null)
     * agar di sisi pembeli tidak muncul kurir prematur sebelum barang dikirim.
     */
    if (['IN_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(status)) {
      if (resi?.trim()) updateData.resi = resi.trim();
      if (courier?.trim()) updateData.courier = courier.trim();
    } else {
      updateData.resi = null;
      updateData.courier = null;
    }

    await prisma.order.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.order.update>[0]['data']
    });

    await recordAdminLog({
      adminId: admin.adminId,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'order',
      entityId: id,
      details: `Mengubah status pesanan menjadi ${status}${resi ? ` (Resi: ${resi}, Kurir: ${courier})` : ''}`
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal memperbarui status pesanan' };
  }
}
