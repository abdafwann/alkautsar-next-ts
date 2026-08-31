'use client';

import { ErrorBoundary as ReactErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Generic Page Error Boundary
 * Wrap any page content with this to add error resilience
 */
export function PageErrorBoundary({
  children,
  title = 'Terjadi Kesalahan',
  description = 'Maaf, terjadi kesalahan saat memuat halaman ini.',
  showRetry = true,
  className = '',
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  showRetry?: boolean;
  className?: string;
}) {
  return (
    <ReactErrorBoundary
      fallback={
        <div className={`bg-white p-8 rounded-2xl border border-red-200 shadow-sm ${className}`}>
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-red-700 mb-2">{title}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
            {showRetry && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Halaman
              </button>
            )}
          </div>
        </div>
      }
    >
      {children}
    </ReactErrorBoundary>
  );
}

/**
 * Component-specific Error Boundary
 * Use this for wrapping individual components that might fail
 */
export function ComponentErrorBoundary({
  children,
  fallback = null,
  onError,
  className = '',
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  className?: string;
}) {
  return (
    <ReactErrorBoundary
      fallback={
        fallback || (
          <div className={`p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 ${className}`}>
            <p className="text-sm">Komponen gagal dimuat</p>
          </div>
        )
      }
      onError={onError ? (error) => onError(error) : undefined}
    >
      {children}
    </ReactErrorBoundary>
  );
}
