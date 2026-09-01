import { redis } from './redis';
import { headers } from 'next/headers';

/**
 * IP-based blocking for brute force protection
 * Stores failed login attempts in Redis and blocks IPs after threshold
 */

const BLOCK_DURATION_SECONDS = 15 * 60; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;
const KEY_PREFIX = 'ip:block:';

/**
 * Check if an IP is blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    const blocked = await redis.get(`${KEY_PREFIX}${ip}`);
    return blocked !== null && blocked !== 0;
  } catch (error) {
    console.error('Error checking IP block:', error);
    return false; // Fail open - don't block legitimate users if Redis is down
  }
}

/**
 * Get the number of failed attempts for an IP
 */
export async function getFailedAttempts(ip: string): Promise<number> {
  try {
    const attempts = await redis.get(`${KEY_PREFIX}attempts:${ip}`);
    return attempts ? Number(attempts) : 0;
  } catch (error) {
    console.error('Error getting failed attempts:', error);
    return 0;
  }
}

/**
 * Record a failed login attempt and block IP if threshold exceeded
 */
export async function recordFailedAttempt(ip: string): Promise<{ blocked: boolean; remainingAttempts: number }> {
  try {
    const attemptsKey = `${KEY_PREFIX}attempts:${ip}`;

    // Increment attempts
    const newAttempts = await redis.incr(attemptsKey);

    // Set expiry on first attempt (when count becomes 1)
    if (newAttempts === 1) {
      await redis.expire(attemptsKey, BLOCK_DURATION_SECONDS);
    }

    // Check if we should block
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      await blockIP(ip);
      await redis.del(attemptsKey);
      return { blocked: true, remainingAttempts: 0 };
    }

    return { blocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - newAttempts };
  } catch (error) {
    console.error('Error recording failed attempt:', error);
    return { blocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }
}

/**
 * Block an IP address
 */
export async function blockIP(ip: string): Promise<void> {
  try {
    await redis.setex(`${KEY_PREFIX}${ip}`, BLOCK_DURATION_SECONDS, '1');
    console.log(`IP blocked: ${ip} for ${BLOCK_DURATION_SECONDS} seconds`);
  } catch (error) {
    console.error('Error blocking IP:', error);
  }
}

/**
 * Unblock an IP address
 */
export async function unblockIP(ip: string): Promise<void> {
  try {
    await redis.del(`${KEY_PREFIX}${ip}`);
    await redis.del(`${KEY_PREFIX}attempts:${ip}`);
  } catch (error) {
    console.error('Error unblocking IP:', error);
  }
}

/**
 * Clear failed attempts on successful login
 */
export async function clearFailedAttempts(ip: string): Promise<void> {
  try {
    await redis.del(`${KEY_PREFIX}attempts:${ip}`);
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
}

/**
 * Get client IP from request headers
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
         headersList.get('x-real-ip') ||
         '127.0.0.1';
}

/**
 * Middleware-style check: returns error response if IP is blocked
 */
export async function checkIPBlock(): Promise<{ blocked: boolean; ip?: string }> {
  const ip = await getClientIP();

  if (await isIPBlocked(ip)) {
    return { blocked: true, ip };
  }

  return { blocked: false };
}
