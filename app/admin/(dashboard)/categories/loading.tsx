import { AdminMetricCardsSkeleton, AdminTableSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Category Manager.
 */
export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={4} />
      <AdminTableSkeleton rows={6} columns={3} tabCount={3} />
    </div>
  );
}
