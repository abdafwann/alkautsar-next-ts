import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { OrdersListClient } from './OrdersListClient';

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId as string },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: {
            include: { images: true }
          },
        }
      }
    }
  });

  const serializedOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Daftar Transaksi</h2>
        <p className="text-xs text-gray-500 mt-1">Pantau dan kelola riwayat pesanan Anda.</p>
      </div>

      <OrdersListClient initialOrders={serializedOrders} />
    </div>
  );
}
