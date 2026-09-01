import { AdminMetricCardsSkeleton, AdminChartSkeleton } from '@/components/admin/skeletons/AdminSkeletons';
import { Skeleton, SkeletonCircle } from '@/components/ui/Skeleton';

/**
 * Next.js route boundary suspense fallback for Financial & Sales Reports.
 */
export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Top Filter Bar Skeleton */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-xs flex items-center justify-between">
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* 5 KPI Metric Cards */}
      <AdminMetricCardsSkeleton count={5} />

      {/* Main Charts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AdminChartSkeleton />
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex flex-col justify-between h-80">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <Skeleton className="h-4 w-32" />
            <SkeletonCircle size="w-7 h-7" />
          </div>
          <div className="space-y-3 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                  <div className="space-y-1 flex-1 min-w-0">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-3 w-full" />
        </div>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs space-y-3">
            <Skeleton className="h-4 w-36" />
            <div className="space-y-2.5 pt-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
