import { AdminDashboardHomeSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Admin Dashboard Overview.
 */
export default function DashboardLoading() {
  return <AdminDashboardHomeSkeleton />;
}
