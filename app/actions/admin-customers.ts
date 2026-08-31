'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';

export async function getAdminCustomers() {
  try {
    await requireAdmin();

    const customers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          select: {
            orderItems: {
              select: {
                price: true,
                count: true,
              },
            },
          },
        },
      },
    });

    const customersWithStats = customers.map((customer) => {
      const totalSpent = customer.orders.reduce((sum, order) => {
        const orderTotal = order.orderItems.reduce(
          (itemSum, item) => itemSum + Number(item.price) * item.count,
          0
        );
        return sum + orderTotal;
      }, 0);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        avatar: customer.avatar,
        province: customer.province,
        city: customer.city,
        address: customer.address,
        isBlocked: customer.isBlocked ?? false,
        createdAt: customer.createdAt.toISOString(),
        totalOrders: customer._count.orders,
        totalSpent,
      };
    });

    return { success: true, data: customersWithStats };
  } catch (error: any) {
    console.error('Get customers error:', error);
    return { success: false, error: error.message || 'Gagal mengambil daftar pelanggan' };
  }
}

export async function toggleCustomerBlockStatus(id: string, block: boolean) {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id },
      data: { isBlocked: block },
    });

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Toggle block status error:', error);
    return { success: false, error: error.message || 'Gagal mengubah status akun' };
  }
}
