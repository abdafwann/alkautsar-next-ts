import OrderListClient from './OrderListClient';
import { Metadata } from 'next';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';
import { getAdminOrders } from '@/app/actions/admin-orders';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manajemen Pesanan | Admin Al-Kautsar',
  description: 'Kelola semua pesanan pelanggan',
};

export default async function AdminOrdersPage() {
  const res = await getAdminOrders({ page: 1, limit: 10 });
  const initialOrders = res.success && res.data ? res.data.orders : [];
  const initialPagination = res.success && res.data ? res.data.pagination : { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <AdminPageErrorBoundary>
      <OrderListClient 
        initialOrders={initialOrders as any[]} 
        initialPagination={initialPagination} 
        error={!res.success ? res.error : undefined}
      />
    </AdminPageErrorBoundary>
  );
}
