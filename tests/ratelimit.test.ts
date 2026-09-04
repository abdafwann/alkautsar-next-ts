import { describe, it, expect } from 'vitest';
import { globalLimiter, authLimiter, checkoutLimiter } from '@/lib/ratelimit';

describe('Resilient Rate Limiter (lib/ratelimit.ts)', () => {
  it('should allow requests within limit in fallback mode', async () => {
    const res = await globalLimiter.limit('test-ip-1');
    expect(res.success).toBe(true);
    expect(res.limit).toBe(100);
  });

  it('should rate limit excessive requests on auth limiter', async () => {
    const testId = `auth-test-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const res = await authLimiter.limit(testId);
      expect(res.success).toBe(true);
    }

    // 6th request should fail
    const blockedRes = await authLimiter.limit(testId);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });
});
