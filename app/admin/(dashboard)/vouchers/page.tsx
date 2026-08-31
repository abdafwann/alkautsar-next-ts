import { Metadata } from 'next';
import { getVouchers } from '@/app/actions/admin-vouchers';
import VoucherListClient from './VoucherListClient';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kupon & Voucher Diskon | Admin Al-Kautsar',
  description: 'Kelola kode promosi, diskon persentase, nominal potongan harga, dan kuota voucher',
};

export default async function AdminVouchersPage() {
  const response = await getVouchers();
  const initialVouchers = response.success && response.data ? (response.data as any[]) : [];

  return (
    <AdminPageErrorBoundary>
      <div className="space-y-6">
        {/* Voucher Manager Client */}
        <VoucherListClient 
          initialVouchers={initialVouchers}
          error={!response.success ? response.error : undefined}
        />
      </div>
    </AdminPageErrorBoundary>
  );
}
