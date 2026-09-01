import { AdminMetricCardsSkeleton, AdminTableSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Admin & Staff management.
 */
export default function StaffManagementLoading() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={3} />
      <AdminTableSkeleton rows={5} columns={4} tabCount={2} />
    </div>
  );
}
