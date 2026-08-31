/**
 * Error Tracking and Monitoring Utilities
 * Provides centralized error tracking and logging
 */

import { prisma } from './prisma';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  PERFORMANCE = 'PERFORMANCE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  PAYMENT = 'PAYMENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error log entry structure
 */
export interface ErrorLogEntry {
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  userId?: string;
  adminId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  requestId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * In-memory error buffer for batch logging (useful for high-traffic scenarios)
 */
const errorBuffer: ErrorLogEntry[] = [];
const ERROR_BUFFER_SIZE = 100;
const ERROR_BUFFER_INTERVAL = 60000; // 1 minute

/**
 * Log an error to the database
 */
export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    // Add to buffer
    errorBuffer.push(entry);

    // In production, you might want to use a dedicated error tracking service like Sentry
    // For now, we'll log to the database if the error is severe enough
    if (entry.severity === ErrorSeverity.HIGH || entry.severity === ErrorSeverity.CRITICAL) {
      // Check if ErrorLog model exists in schema before logging to DB
      const errorLogModel = (prisma as any).errorLog;
      if (errorLogModel) {
        await errorLogModel.create({
          data: {
            severity: entry.severity,
            category: entry.category,
            message: entry.message,
            stack: entry.stack,
            userId: entry.userId,
            adminId: entry.adminId,
            ip: entry.ip,
            userAgent: entry.userAgent,
            path: entry.path,
            method: entry.method,
            metadata: entry.metadata,
          }
        }).catch(() => {
          // Fallback to console if error log table doesn't exist
          console.error('[ERROR_TRACKING]', JSON.stringify(entry));
        });
      } else {
        // No ErrorLog table - log to console
        console.error('[ERROR_TRACKING]', JSON.stringify(entry));
      }
    }

    // Always log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${entry.severity}] [${entry.category}] ${entry.message}`, {
        stack: entry.stack,
        ...entry.metadata,
      });
    }

    // Flush buffer if it gets too large
    if (errorBuffer.length >= ERROR_BUFFER_SIZE) {
      await flushErrorBuffer();
    }
  } catch (error) {
    // Never let error tracking break the application
    console.error('Failed to log error:', error);
  }
}

/**
 * Flush the error buffer (for batch processing)
 */
export async function flushErrorBuffer(): Promise<void> {
  if (errorBuffer.length === 0) return;

  const errorsToLog = errorBuffer.splice(0, ERROR_BUFFER_SIZE);

  try {
    const errorLogModel = (prisma as any).errorLog;
    if (errorLogModel) {
      await errorLogModel.createMany({
        data: errorsToLog.map(e => ({
          severity: e.severity,
          category: e.category,
          message: e.message,
          stack: e.stack,
          userId: e.userId,
          adminId: e.adminId,
          ip: e.ip,
          userAgent: e.userAgent,
          path: e.path,
          method: e.method,
          metadata: e.metadata,
        })),
      }).catch(() => {
        console.error('[ERROR_BUFFER_FLUSH_FAILED]', errorsToLog);
      });
    }
  } catch (error) {
    console.error('Failed to flush error buffer:', error);
  }
}

// Set up periodic buffer flush
if (typeof setInterval !== 'undefined') {
  setInterval(flushErrorBuffer, ERROR_BUFFER_INTERVAL);
}

/**
 * Categorize an error based on its message or stack
 */
export function categorizeError(error: any): ErrorCategory {
  const message = (error?.message || error?.toString() || '').toLowerCase();
  const stack = (error?.stack || '').toLowerCase();
  const combined = message + ' ' + stack;

  if (combined.includes('auth') || combined.includes('jwt') || combined.includes('token') || combined.includes('credential')) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (combined.includes('permission') || combined.includes('forbidden') || combined.includes('unauthorized')) {
    return ErrorCategory.AUTHORIZATION;
  }
  if (combined.includes('validation') || combined.includes('invalid') || combined.includes('schema')) {
    return ErrorCategory.VALIDATION;
  }
  if (combined.includes('prisma') || combined.includes('database') || combined.includes('sql') || combined.includes('connection')) {
    return ErrorCategory.DATABASE;
  }
  if (combined.includes('network') || combined.includes('fetch') || combined.includes('timeout') || combined.includes('connection')) {
    return ErrorCategory.NETWORK;
  }
  if (combined.includes('midtrans') || combined.includes('payment') || combined.includes('transaction')) {
    return ErrorCategory.PAYMENT;
  }
  if (combined.includes('cloudinary') || combined.includes('redis') || combined.includes('upstash')) {
    return ErrorCategory.EXTERNAL_SERVICE;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Determine error severity based on error type and context
 */
export function determineSeverity(error: any, context?: { isUserFacing?: boolean }): ErrorSeverity {
  // Payment errors are always high severity
  if (categorizeError(error) === ErrorCategory.PAYMENT) {
    return ErrorSeverity.HIGH;
  }

  // Database errors in production are high severity
  if (categorizeError(error) === ErrorCategory.DATABASE && process.env.NODE_ENV === 'production') {
    return ErrorSeverity.HIGH;
  }

  // User-facing errors are medium severity (expected)
  if (context?.isUserFacing) {
    return ErrorSeverity.MEDIUM;
  }

  // Stack traces indicate internal errors
  if (error?.stack) {
    return ErrorSeverity.MEDIUM;
  }

  return ErrorSeverity.LOW;
}

/**
 * Create a wrapped error handler for server actions
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    action?: string;
  }
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const category = options?.category || categorizeError(error);
      const severity = options?.severity || determineSeverity(error);

      await logError({
        severity,
        category,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        action: options?.action,
      });

      throw error;
    }
  };
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMetrics = {
  /**
   * Track the duration of an operation
   */
  async track<T>(
    name: string,
    fn: () => T | Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;

      // Log slow operations (> 1000ms)
      if (duration > 1000) {
        await logError({
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.PERFORMANCE,
          message: `Slow operation: ${name} took ${duration.toFixed(2)}ms`,
          metadata: { operation: name, duration },
        });
      }

      // Always log in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
      }
    }
  },

  /**
   * Mark a timing point
   */
  mark(name: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PERF] Mark: ${name}`, metadata);
    }
  },
};

/**
 * Request logging utility
 */
export async function logRequest(request: Request, response?: Response) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const logData = {
    method: request.method,
    url: request.url,
    ip,
    userAgent,
    status: response?.status,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[REQUEST]', JSON.stringify(logData));
  }

  // Log slow requests (> 5000ms)
  // This would need to be implemented with actual timing
}

/**
 * Health check endpoint helper
 */
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks: Record<string, boolean> = {};

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Check Redis (if available)
  try {
    const { redis } = await import('./redis');
    await redis.ping();
    checks.redis = true;
  } catch {
    checks.redis = false;
  }

  const allHealthy = Object.values(checks).every(v => v);
  const someHealthy = Object.values(checks).some(v => v);

  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
}
