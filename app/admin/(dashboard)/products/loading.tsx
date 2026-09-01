import { AdminMetricCardsSkeleton, AdminTableSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Catalog / Products list.
 */
export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={4} />
      <AdminTableSkeleton rows={8} columns={5} tabCount={4} />
    </div>
  );
}
