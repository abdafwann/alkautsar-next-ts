import { AdminFormSkeleton } from '@/components/admin/skeletons/AdminSkeletons';

/**
 * Next.js route boundary suspense fallback for Store Settings.
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <AdminFormSkeleton fieldCount={8} />
    </div>
  );
}
