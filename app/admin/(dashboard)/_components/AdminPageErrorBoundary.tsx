'use client';

import { ErrorBoundary as ReactErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { ReactNode } from 'react';

interface AdminPageErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Admin-specific Error Boundary wrapper
 * Wraps admin pages with error handling
 */
export default function AdminPageErrorBoundary({ children }: AdminPageErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallback={
        <div className="bg-white p-8 rounded-2xl border border-red-200">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-gray-600 mb-4">
              Maaf, terjadi kesalahan saat memuat halaman ini.
            </p>
            <p className="text-sm text-gray-500">
              Silakan refresh halaman atau hubungi administrator.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ReactErrorBoundary>
  );
}
