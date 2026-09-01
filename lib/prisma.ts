import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'async_hooks';

const connectionString = process.env.DATABASE_URL!;

// Configure connection pool with sensible limits to prevent connection exhaustion
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 10, // Maintain max 10 active connections per worker
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail fast if DB is unreachable after 5s
});

const adapter = new PrismaPg(pool);
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface RlsContext {
  userId: string;
  isAdmin?: boolean;
}

// Thread-safe request isolation storage preventing concurrent request context leakage
const rlsStorage = new AsyncLocalStorage<RlsContext>();

/**
 * Execute an asynchronous operation with an isolated RLS context.
 * Guarantees zero context leakage across concurrent Node.js requests.
 */
export function runWithRlsContext<T>(ctx: RlsContext, fn: () => Promise<T>): Promise<T> {
  return rlsStorage.run(ctx, fn);
}

// Fallback holder for procedural server actions
let fallbackRlsContext: RlsContext | null = null;

export function setRlsContext(ctx: RlsContext) {
  fallbackRlsContext = ctx;
}

export function getRlsContext(): RlsContext | null {
  return rlsStorage.getStore() ?? fallbackRlsContext;
}

export function clearRlsContext() {
  fallbackRlsContext = null;
}
