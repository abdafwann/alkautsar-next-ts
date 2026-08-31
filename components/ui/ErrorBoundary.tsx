'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom className for the fallback container */
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponentThatMightCrash />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      errorInfo,
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, className = '' } = this.props;

    // If there's an error, show fallback UI
    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border border-red-200 bg-red-50 ${className}`}
          role="alert"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-lg font-bold text-red-800 mb-2">
            Terjadi Kesalahan
          </h3>

          <p className="text-sm text-red-600 text-center mb-4 max-w-md">
            Maaf, terjadi kesalahan saat memuat komponen ini.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="w-full max-w-lg mb-4 p-3 bg-red-100 rounded-lg text-left">
              <summary className="text-sm font-semibold text-red-700 cursor-pointer">
                Detail Error (Development Only)
              </summary>
              <pre className="mt-2 text-xs text-red-800 overflow-auto max-h-48">
                <strong>Error:</strong> {error.message}
                {'\n\n'}
                <strong>Stack:</strong>
                {'\n'}
                {error.stack}
                {errorInfo && (
                  <>
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {'\n'}
                    {errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      );
    }

    // If no error, render children normally
    return children;
  }
}

/**
 * Simple functional wrapper for ErrorBoundary
 * Useful for wrapping components directly in JSX
 */
interface SimpleErrorBoundaryProps {
  children: ReactNode;
  className?: string;
  showDetails?: boolean;
}

interface SimpleState {
  hasError: boolean;
  error: Error | null;
}

export class SimpleErrorBoundary extends Component<SimpleErrorBoundaryProps, SimpleState> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SimpleState {
    return { hasError: true, error };
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error } = this.state;
      const { className = '', showDetails = false } = this.props;

      return (
        <div
          className={`flex flex-col items-center justify-center p-6 rounded-xl border border-red-200 bg-red-50 ${className}`}
        >
          <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-red-700 font-medium mb-3">
            Komponen gagal dimuat
          </p>

          {showDetails && error && (
            <pre className="text-xs text-red-600 mb-3 p-2 bg-red-100 rounded max-w-full overflow-auto">
              {error.message}
            </pre>
          )}

          <button
            onClick={this.handleRetry}
            className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC (Higher Order Component) for adding error boundary to any component
 *
 * Usage:
 * ```tsx
 * const SafeProductList = withErrorBoundary(ProductList, {
 *   fallback: <ProductListError />
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    className?: string;
  } = {}
): React.FC<P> {
  const { fallback, onError, className } = options;

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback} onError={onError} className={className}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorBoundary;
}
