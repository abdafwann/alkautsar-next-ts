import { AdminMetricCardsSkeleton, AdminTableSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Admin Activity Audit Logs.
 */
export default function LogsLoading() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={4} />
      <AdminTableSkeleton rows={10} columns={5} tabCount={6} />
    </div>
  );
}
