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
      <div className="pb-5 border-b border-[#ede8de]">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-1">
          Riwayat &amp; Status
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight">
          Pesanan &amp; Transaksi
        </h2>
        <p className="text-xs text-text-main/70 mt-1 leading-relaxed">
          Pantau status pemrosesan paket fitofarmaka, riwayat pembayaran, dan nomor resi pengiriman.
        </p>
      </div>

      <OrdersListClient initialOrders={serializedOrders} />
    </div>
  );
}
