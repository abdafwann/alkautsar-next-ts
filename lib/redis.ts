import { Redis } from '@upstash/redis';

// Safe Redis initialization with in-memory fallback for local development & CI environments
function createRedisClient(): Redis | {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any, options?: any) => Promise<string>;
  del: (key: string) => Promise<number>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
} {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith('http')) {
    try {
      return new Redis({ url, token });
    } catch (e) {
      console.warn('Failed to connect to Upstash Redis, switching to in-memory fallback.');
    }
  }

  // In-memory mock store for local dev & testing
  const memoryStore = new Map<string, { value: any; expiry?: number }>();

  return {
    async get(key: string) {
      const item = memoryStore.get(key);
      if (!item) return null;
      if (item.expiry && Date.now() > item.expiry) {
        memoryStore.delete(key);
        return null;
      }
      return item.value;
    },
    async set(key: string, value: any, options?: { ex?: number }) {
      const expiry = options?.ex ? Date.now() + options.ex * 1000 : undefined;
      memoryStore.set(key, { value, expiry });
      return 'OK';
    },
    async del(key: string) {
      const deleted = memoryStore.delete(key);
      return deleted ? 1 : 0;
    },
    async incr(key: string) {
      const current = (await this.get(key)) || 0;
      const next = Number(current) + 1;
      await this.set(key, next);
      return next;
    },
    async expire(key: string, seconds: number) {
      const item = memoryStore.get(key);
      if (item) {
        item.expiry = Date.now() + seconds * 1000;
        return 1;
      }
      return 0;
    }
  };
}

export const redis = createRedisClient() as unknown as Redis;
