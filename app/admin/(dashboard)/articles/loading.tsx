import { AdminMetricCardsSkeleton, AdminTableSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Blog / Article CMS.
 */
export default function ArticlesLoading() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={4} />
      <AdminTableSkeleton rows={8} columns={5} tabCount={3} />
    </div>
  );
}
