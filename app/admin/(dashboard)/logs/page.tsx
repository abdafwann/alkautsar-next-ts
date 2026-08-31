import { Metadata } from 'next';
import AdminLogClient from './AdminLogClient';
import { getAdminLogs } from '@/app/actions/admin-logs';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const metadata: Metadata = {
  title: 'Log Aktivitas Admin | Admin Al-Kautsar',
  description: 'Audit trail dan riwayat aktivitas admin',
};

export default async function AdminLogsPage() {
  const result = await getAdminLogs();
  
  return (
    <AdminPageErrorBoundary>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Log Aktivitas Admin</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Catatan riwayat audit dan aktivitas operasional admin dalam mengelola sistem.
          </p>
        </div>

        <AdminLogClient 
          initialData={result.success && result.data ? (result.data as any[]) : []} 
          error={!result.success ? result.error : undefined} 
        />
      </div>
    </AdminPageErrorBoundary>
  );
}
