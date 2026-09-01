import { AdminMetricCardsSkeleton, AdminTableSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Customer Inquiries & Messages.
 */
export default function InquiriesLoading() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={3} />
      <AdminTableSkeleton rows={8} columns={5} tabCount={3} />
    </div>
  );
}
