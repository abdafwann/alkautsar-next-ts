import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'async_hooks';

const connectionString = process.env.DATABASE_URL!;

// Configure connection pool with conservative per-worker limits (max 3) so concurrent Next.js build workers (11x) never exhaust database pool limits
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 3, // Conservative 3 connections per worker thread prevents connection spikes during parallel builds
  idleTimeoutMillis: 10000, // Quickly reclaim idle connections within 10s
  connectionTimeoutMillis: 5000, // Fail fast if database is unreachable after 5s
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
