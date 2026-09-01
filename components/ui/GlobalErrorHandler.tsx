'use client';

import { useEffect } from 'react';

/**
 * Global Error Handler Component
 * Catches unhandled errors and JavaScript errors outside React boundaries
 *
 * Usage: Add this to your root layout
 * ```tsx
 * <html>
 *   <body>
 *     {children}
 *     <GlobalErrorHandler />
 *   </body>
 * </html>
 * ```
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);

      // You can send this to an error tracking service like Sentry
      // eventTrackingService.trackError(event.reason);
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught Error:', event.error);

      // You can send this to an error tracking service
      // eventTrackingService.trackError(event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}

/**
 * Script to inject into HTML head for graceful degradation
 * This handles errors that happen before React hydrates
 */
export const errorHandlerScript = `
<script>
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', { message, source, lineno, colno, error });
    // Send to error tracking service
    return false;
  };

  window.onunhandledrejection = function(event) {
    console.error('Unhandled rejection:', event.reason);
    // Send to error tracking service
  };
</script>
`;
