# RLS (Row Level Security) Integration Guide

This guide explains how to use the RLS (Row Level Security) context in your codebase.

## Overview

RLS adds database-level protection to ensure users can only access their own data. Even if app-level authorization checks fail, RLS provides a backup layer of protection.

## Files Created

| File | Purpose |
|------|---------|
| `prisma/migrations/20260821_rls_isolation/migration.sql` | SQL to enable RLS policies |
| `lib/prisma-context.ts` | Context management utilities |
| `lib/prisma.ts` | Updated Prisma client with RLS middleware |

---

## How RLS Works

```
User Request
    ↓
App Level Check: if (order.userId !== session.userId) ← PRIMARY
    ↓
Database Query → RLS Policy checks current_setting('app.user_id') ← BACKUP
    ↓
RLS allows or denies access ← FINAL PROTECTION
```

---

## Usage in Server Actions

### Setting Context (Required Before Protected Queries)

```typescript
// app/actions/orders.ts
'use server';

import { prisma, setRlsContextFromSession, clearRlsContext } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function getUserOrders() {
    // 1. Get authenticated session
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    // 2. Set RLS context (IMPORTANT!)
    setRlsContextFromSession({
        userId: session.userId,
        isAdmin: false, // or check if user is admin
    });

    try {
        // 3. Query data - RLS will filter automatically
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // 4. Clear context when done (optional, but good practice)
        clearRlsContext();

        return { success: true, data: orders };
    } catch (error) {
        clearRlsContext();
        return { error: 'Failed to fetch orders' };
    }
}
```

### Admin Actions

```typescript
// app/actions/admin-orders.ts
'use server';

import { prisma, setRlsContextFromSession, clearRlsContext } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { encodedKey } from '@/lib/session';

export async function getAllOrders() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
        return { error: 'Unauthorized' };
    }

    try {
        const verified = await jwtVerify(token, encodedKey);
        const payload = verified.payload;

        // Set admin context - RLS will allow full access
        setRlsContextFromSession({
            userId: payload.adminId as string,
            isAdmin: true, // This bypasses RLS for admins
        });

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });

        clearRlsContext();
        return { success: true, data: orders };
    } catch (error) {
        clearRlsContext();
        return { error: 'Failed to fetch orders' };
    }
}
```

---

## Where to Set RLS Context

### Server Actions
Set context at the start of each server action:

```typescript
// Before any database query
setRlsContextFromSession({ userId, isAdmin });
```

### API Routes
Set context at the start of each API route:

```typescript
// app/api/orders/route.ts
export async function GET(req: Request) {
    const session = await getSession();
    if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    setRlsContextFromSession({
        userId: session.userId,
        isAdmin: false,
    });

    // ... queries
}
```

---

## Important Notes

### 1. Always Set Context Before Protected Queries
RLS policies only work if context is set. Always call `setRlsContextFromSession()` before querying protected tables.

### 2. Admin Bypass
When `isAdmin: true`, RLS policies allow full access to all rows. This is for admin users.

### 3. Clear Context After Use
Call `clearRlsContext()` when done, especially in error cases. This prevents context leaking to other requests.

### 4. Protected Tables
RLS is enabled on these tables:
- `Order` - Users see own orders, admins see all
- `CartItem` - Users see own cart only (no admin bypass)
- `User` - Users see own profile, admins see all

### 5. Guest Checkout
Orders without `userId` (guest checkout) are allowed if `guestEmail` is set.

---

## Testing RLS

### Manual Testing

1. **User flow:**
   ```bash
   # Login as regular user
   # Check that orders, cart only show user's own data
   ```

2. **Admin flow:**
   ```bash
   # Login as admin
   # Check that all orders, all users are visible
   ```

### Database Testing
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('Order', 'CartItem', 'User');

-- Check policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'Order';
```

---

## Running the Migration

```bash
# Apply the RLS migration
npx prisma migrate deploy --name 20260821_rls_isolation

# Or for development
npx prisma migrate dev --name 20260821_rls_isolation
```

---

## Troubleshooting

### "RLS context not set" Error
This means you called a database function without setting context first. Add:
```typescript
setRlsContextFromSession({ userId, isAdmin });
```

### Admin Can't See All Data
Check that `isAdmin: true` is passed:
```typescript
setRlsContextFromSession({ userId: adminId, isAdmin: true });
```

### Performance Concerns
RLS adds ~0.01ms overhead per query. For most applications, this is negligible.

---

## Security Principle

**Defense in Depth:**
- App-level checks are the primary protection
- RLS is the backup protection
- If someone bypasses app checks, RLS still protects the data
