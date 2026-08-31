import { Metadata } from 'next';
import ReportsClient from './ReportsClient';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Laporan Keuangan | Admin Al-Kautsar',
  description: 'Pantau metrik omset penjualan, tren pendapatan tahunan, dan produk terlaris',
};

export default function AdminReportsPage() {
  return (
    <AdminPageErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Keuangan & Analitik</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau metrik omset penjualan, pertumbuhan pesanan, nilai transaksi rata-rata, dan produk herbal terlaris.
          </p>
        </div>

        {/* Client Reports Component */}
        <ReportsClient />
      </div>
    </AdminPageErrorBoundary>
  );
}
