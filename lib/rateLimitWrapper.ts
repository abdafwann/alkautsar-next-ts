import { globalLimiter, authLimiter } from './ratelimit';

// Standardized return type so our app doesn't depend on Upstash's exact types
export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Wrapper function for Rate Limiting.
 * If we ever switch away from Upstash, we only need to change the logic inside this function.
 */
export async function checkRateLimit(ip: string, type: 'auth' | 'global'): Promise<RateLimitResult> {
  const limiter = type === 'auth' ? authLimiter : globalLimiter;
  
  // Call the external library
  const result = await limiter.limit(ip);
  
  // Map to our internal standardized object
  return {
    isAllowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    resetTime: result.reset
  };
}
