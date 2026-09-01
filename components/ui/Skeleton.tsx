import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

/**
 * Low-level UI placeholder to eliminate Cumulative Layout Shift (CLS) during asynchronous data fetching.
 * Marked with aria-hidden so screen readers rely on live region status updates rather than reading placeholder DOM.
 */
export function Skeleton({
  className = '',
  variant = 'rounded',
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#F2EFEF] dark:bg-gray-800/30 ${variantStyles} ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 1,
  className = '',
  lastLineWidth = '75%',
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        return (
          <Skeleton
            key={index}
            className="h-3.5 w-full"
            style={isLast && lines > 1 ? { width: lastLineWidth } : undefined}
          />
        );
      })}
    </div>
  );
}

export function SkeletonCircle({
  size = 'w-9 h-9',
  className = '',
}: {
  size?: string;
  className?: string;
}) {
  return <Skeleton variant="circular" className={`${size} shrink-0 ${className}`} />;
}
