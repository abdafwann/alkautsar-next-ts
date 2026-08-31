/**
 * RLS (Row Level Security) Context Manager
 *
 * Purpose: Set PostgreSQL session context before queries to enable RLS policies.
 * Uses Node.js AsyncLocalStorage to guarantee thread-safe request isolation.
 */

import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

export interface UserContext {
  userId: string;
  isAdmin?: boolean;
}

const asyncLocalStorage = new AsyncLocalStorage<UserContext>();
let fallbackContext: UserContext | null = null;

/**
 * Execute an operation with an isolated RLS context.
 */
export function runWithContext<T>(context: UserContext, fn: () => Promise<T>): Promise<T> {
  return asyncLocalStorage.run(context, fn);
}

export function setRlsContext(context: UserContext): void {
  fallbackContext = context;
}

export function getRlsContext(): UserContext | null {
  return asyncLocalStorage.getStore() ?? fallbackContext;
}

export function clearRlsContext(): void {
  fallbackContext = null;
}

/**
 * Set RLS context in PostgreSQL session variables via set_config
 */
export async function setContextInPrisma(
  prisma: PrismaClient,
  context: UserContext
): Promise<void> {
  await prisma.$executeRaw`
    SELECT set_config('app.user_id', ${context.userId}, false)
  `;

  await prisma.$executeRaw`
    SELECT set_config('app.is_admin', ${context.isAdmin ? 'true' : 'false'}, false)
  `;
}

export async function withRlsContext(
  prisma: PrismaClient,
  context: UserContext
): Promise<PrismaClient> {
  await setContextInPrisma(prisma, context);
  return prisma;
}

export function validateRlsContext(action: string): void {
  const ctx = getRlsContext();
  if (!ctx || !ctx.userId) {
    throw new Error(
      `RLS context not set. Cannot perform action: ${action}. ` +
      'Ensure user is authenticated before making database calls.'
    );
  }
}

export function isAdmin(): boolean {
  return getRlsContext()?.isAdmin === true;
}

export function isAuthenticated(): boolean {
  const ctx = getRlsContext();
  return ctx !== null && !!ctx.userId;
}
