import React from 'react';
import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';

/**
 * Metric cards placeholder matching the 2-to-5 column grid layout used across all admin dashboard modules.
 * Pre-allocates exact dimensions to maintain visual continuity when switching between timeframes or pages.
 */
export function AdminMetricCardsSkeleton({ count = 4 }: { count?: number }) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
  }[count as 2 | 3 | 4 | 5] || 'grid-cols-2 md:grid-cols-4';

  return (
    <div className={`grid ${gridClasses} gap-3.5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5"
        >
          <SkeletonCircle size="w-9 h-9" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tab and search filter bar placeholder.
 */
export function AdminFilterBarSkeleton({ tabCount = 4 }: { tabCount?: number }) {
  return (
    <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: tabCount }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-gray-100">
        <Skeleton className="h-9 w-full sm:max-w-md rounded-lg" />
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Standard table skeleton for data grids (Products, Orders, Customers, Logs, Categories, Articles).
 * Configurable row count and column count matching real data density.
 */
export function AdminTableSkeleton({
  rows = 8,
  columns = 5,
  showFilterBar = true,
  tabCount = 4,
}: {
  rows?: number;
  columns?: number;
  showFilterBar?: boolean;
  tabCount?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
      {showFilterBar && <AdminFilterBarSkeleton tabCount={tabCount} />}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/60 border-b border-gray-100">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3.5 px-4">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/30">
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const isFirstCol = colIndex === 0;
                  const isLastCol = colIndex === columns - 1;

                  return (
                    <td key={colIndex} className="py-3 px-4 whitespace-nowrap">
                      {isFirstCol ? (
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                          <div className="space-y-1">
                            <Skeleton className="h-3.5 w-36" />
                            <Skeleton className="h-2.5 w-20" />
                          </div>
                        </div>
                      ) : isLastCol ? (
                        <div className="flex justify-end gap-1.5">
                          <Skeleton className="h-7 w-14 rounded-md" />
                          <Skeleton className="h-7 w-7 rounded-md" />
                        </div>
                      ) : (
                        <Skeleton className="h-3.5 w-24" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 border-t border-gray-100 flex items-center justify-between">
        <Skeleton className="h-3.5 w-36" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Chart canvas & performance graphs skeleton matching Reports & Main Dashboard layouts.
 */
export function AdminChartSkeleton() {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex flex-col justify-between h-80">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-7 w-32 rounded-lg" />
      </div>

      <div className="flex-1 flex items-end gap-3 pt-6 pb-2 px-2">
        {Array.from({ length: 12 }).map((_, i) => {
          // Semi-randomized heights produce a natural waveform shimmer silhouette
          const heightPercent = 25 + ((i * 17) % 65);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <Skeleton
                className="w-full rounded-t-md"
                style={{ height: `${heightPercent}%` }}
              />
              <Skeleton className="h-2.5 w-6" />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

/**
 * Form editing layout skeleton (Products form, Articles form, Settings).
 */
export function AdminFormSkeleton({ fieldCount = 6 }: { fieldCount?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/70 p-5 shadow-xs space-y-5">
      <div className="space-y-1.5 pb-4 border-b border-gray-100">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="space-y-1.5 pt-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Whole-page skeleton for the main Executive Dashboard (Home).
 */
export function AdminDashboardHomeSkeleton() {
  return (
    <div className="space-y-6">
      <AdminMetricCardsSkeleton count={4} />

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

      <AdminTableSkeleton rows={5} columns={5} tabCount={3} />
    </div>
  );
}
