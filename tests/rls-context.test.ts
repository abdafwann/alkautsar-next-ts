import { describe, it, expect } from 'vitest';
import { runWithRlsContext, getRlsContext } from '@/lib/prisma';

describe('RLS Concurrency & Context Isolation (lib/prisma.ts)', () => {
  it('should isolate RLS context between concurrent asynchronous operations', async () => {
    const user1Promise = runWithRlsContext({ userId: 'user-alpha', isAdmin: false }, async () => {
      // Simulate async delay
      await new Promise(resolve => setTimeout(resolve, 50));
      return getRlsContext();
    });

    const user2Promise = runWithRlsContext({ userId: 'user-beta', isAdmin: true }, async () => {
      // Simulate shorter async delay
      await new Promise(resolve => setTimeout(resolve, 10));
      return getRlsContext();
    });

    const [context1, context2] = await Promise.all([user1Promise, user2Promise]);

    expect(context1?.userId).toBe('user-alpha');
    expect(context1?.isAdmin).toBe(false);

    expect(context2?.userId).toBe('user-beta');
    expect(context2?.isAdmin).toBe(true);
  });
});
