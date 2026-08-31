import { Metadata } from 'next';
import CustomerListClient from './CustomerListClient';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const metadata: Metadata = {
  title: 'Manajemen Pelanggan | Admin Al-Kautsar',
  description: 'Kelola data pelanggan, total akumulasi belanja, dan status akun',
};

export default function AdminCustomersPage() {
  return (
    <AdminPageErrorBoundary>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Pelanggan</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Kelola data pelanggan terdaftar, riwayat akumulasi belanja, dan pengaturan akses akun.
          </p>
        </div>

        <CustomerListClient />
      </div>
    </AdminPageErrorBoundary>
  );
}
