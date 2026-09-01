import { AdminMetricCardsSkeleton, AdminTableSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Orders management.
 */
export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={4} />
      <AdminTableSkeleton rows={8} columns={6} tabCount={5} />
    </div>
  );
}
