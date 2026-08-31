import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

// Helper to create safe rate limiter that falls back gracefully if Upstash is unconfigured
function createSafeLimiter(requests: number, windowStr: '15 m' | '10 m' | '1 m', prefix: string) {
  const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

  if (hasUpstash) {
    try {
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, windowStr),
        analytics: true,
        prefix,
      });
    } catch {
      // Fallback below
    }
  }

  // In-memory fallback limiter for local dev / testing
  const memoryCounts = new Map<string, { count: number; reset: number }>();
  const windowMs = windowStr === '15 m' ? 15 * 60 * 1000 : windowStr === '10 m' ? 10 * 60 * 1000 : 60 * 1000;

  return {
    async limit(identifier: string) {
      const now = Date.now();
      const record = memoryCounts.get(identifier);

      if (!record || now > record.reset) {
        memoryCounts.set(identifier, { count: 1, reset: now + windowMs });
        return { success: true, limit: requests, remaining: requests - 1, reset: now + windowMs };
      }

      if (record.count >= requests) {
        return { success: false, limit: requests, remaining: 0, reset: record.reset };
      }

      record.count += 1;
      return { success: true, limit: requests, remaining: requests - record.count, reset: record.reset };
    }
  } as unknown as Ratelimit;
}

// 1. Global Limiter: 100 requests per 15 minutes per IP
export const globalLimiter = createSafeLimiter(100, '15 m', '@upstash/ratelimit:global');

// 2. Auth Limiter: 5 requests per 10 minutes per IP (Brute-force protection)
export const authLimiter = createSafeLimiter(5, '10 m', '@upstash/ratelimit:auth');

// 3. Checkout Limiter: 10 requests per 1 minute per IP (Prevent checkout spam)
export const checkoutLimiter = createSafeLimiter(10, '1 m', '@upstash/ratelimit:checkout');
