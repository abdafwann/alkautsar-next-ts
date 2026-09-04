# End-to-End Orders Flow Redesign & Inventory State Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete, secure end-to-end orders lifecycle featuring PostgreSQL pessimistic row locking, anti-hoarding active order limits, dynamic 1h/6h payment cooldown, Midtrans webhook idempotency with stock/sold count rollback, customer tracking, and admin fulfillment stepper (`PROCESSING` ➔ `PREPARING` ➔ `IN_DELIVERY` with Courier/Resi ➔ `DELIVERED` ➔ `COMPLETED` / `RETURN_REQUESTED` ➔ `RETURNED`).

**Architecture:** 
- Database: Prisma schema updated with `PREPARING`, `RETURN_REQUESTED`, and `RETURNED` in `OrderStatus`.
- Checkout: PostgreSQL transactional pessimistic locking (`SELECT ... FOR UPDATE`) with anti-hoarding guards.
- Payment & Webhooks: Dynamic Midtrans Snap duration, automatic stock/voucher rollback on cancellation/expiry, and verified `product.sold` counter increments upon settlement.
- Fulfillment & Security: Next.js Edge `middleware.ts` enforcement, Courier & Resi validation for `IN_DELIVERY`, and sanitized public tracking endpoints.

**Tech Stack:** Next.js 16 (App Router), Prisma ORM, PostgreSQL, Midtrans Client SDK, Jose (JWT), Vitest, Zustand, Tailwind CSS.

**Spec:** [`docs/superpowers/specs/2026-08-28-orders-flow-redesign.md`](file:///e:/Alkautsar-Upgrade/ecommerce-nextjs/docs/superpowers/specs/2026-08-28-orders-flow-redesign.md)

## Global Constraints
- No stock overselling: Every checkout must lock product rows with `SELECT ... FOR UPDATE` inside Prisma transaction.
- Dynamic Cooldown: 1 hour for low-stock items (`stock <= 2`), 6 hours for standard items (`stock > 2`).
- Cancellation Boundary: Customer can cancel only in `WAITING_FOR_PAYMENT`, `PROCESSING`, `PREPARING`. Cancellation blocked in `IN_DELIVERY`+.
- Resi & Courier mandatory when transitioning to `IN_DELIVERY`.
- Public tracking APIs must NEVER return user password hashes, OTPs, or internal credentials.
- All admin mutations strictly guarded with `withAdminAuth`.

---

### Task 1: Prisma Schema Migration & Vitest Baseline Fix
**Files:**
- Modify: `prisma/schema.prisma:170-178`
- Modify: `app/actions/admin-orders.ts:53-75`
- Test: `tests/admin-orders.test.ts`

**Interfaces:**
- Produces: Updated `OrderStatus` enum containing `PREPARING`, `RETURN_REQUESTED`, `RETURNED`. Safe array reduction in `getAdminOrders`.

- [ ] **Step 1: Update Prisma schema OrderStatus enum**
Update `prisma/schema.prisma`:
```prisma
enum OrderStatus {
  WAITING_FOR_PAYMENT
  PROCESSING
  PREPARING
  IN_DELIVERY
  DELIVERED
  COMPLETED
  CANCELLED
  RETURN_REQUESTED
  RETURNED
}
```

- [ ] **Step 2: Fix `admin-orders.ts` reduce bug and status validation**
In `app/actions/admin-orders.ts`:
Change line 54:
```typescript
const subtotal = (order.orderItems || []).reduce((sum, item) => {
  return sum + (Number(item.price) * item.count);
}, 0);
```
And update `VALID` in `updateOrderStatus`:
```typescript
const VALID = ['WAITING_FOR_PAYMENT', 'PROCESSING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'];
```

- [ ] **Step 3: Run Vitest to verify all tests pass**
Run: `npm run test:run`
Expected: PASS (all 95+ tests passing).

---

### Task 2: Pessimistic Row Locking, Anti-Hoarding & Dynamic Expiry in Checkout API
**Files:**
- Modify: `app/api/checkout/route.ts`
- Test: `tests/checkout-locking.test.ts` (create test file)

**Interfaces:**
- Consumes: Prisma transaction client with raw SQL row locking.
- Produces: `POST /api/checkout` returning `{ orderId, token, paymentExpiry }`.

- [ ] **Step 1: Write integration test for checkout locking and anti-hoarding**
Create `tests/checkout-locking.test.ts` verifying:
1. Rejects second unpaid order if user already has an active unpaid order.
2. Applies 1-hour expiry when any item quantity <= 2; 6-hour expiry otherwise.
3. Correctly calculates percentage vouchers using database column `"type"` and respects `maxDiscount`.

- [ ] **Step 2: Implement Pessimistic Locking & Dynamic Expiry in `app/api/checkout/route.ts`**
In `app/api/checkout/route.ts`:
1. Check for active unpaid orders:
```typescript
const existingUnpaid = await prisma.order.findFirst({
  where: {
    OR: [
      session ? { userId: session.userId } : undefined,
      { guestEmail: email.toLowerCase().trim() },
    ].filter(Boolean) as any[],
    orderStatus: 'WAITING_FOR_PAYMENT',
    paymentExpiry: { gt: new Date() }
  }
});
if (existingUnpaid) {
  return NextResponse.json({
    error: 'Anda masih memiliki pesanan yang belum diselesaikan. Selesaikan pembayaran atau batalkan pesanan sebelumnya.'
  }, { status: 400 });
}
```
2. Wrap stock check, voucher lock, decrement, and order creation in a single `prisma.$transaction`:
```typescript
const result = await prisma.$transaction(async (tx) => {
  // Sort product IDs to prevent deadlocks
  const sortedIds = [...productIds].sort();
  const lockedProducts = await tx.$queryRaw<any[]>`
    SELECT id, title, price, "promoPrice", "isPromo", "promoExpiry", quantity 
    FROM "Product" 
    WHERE id = ANY(${sortedIds}::text[]) 
    FOR UPDATE
  `;
  
  const productMap = new Map(lockedProducts.map(p => [p.id, p]));
  let hasLowStock = false;
  
  for (const item of items) {
    const product = productMap.get(item.id);
    if (!product || product.quantity < item.quantity) {
      throw new Error(`Stok tidak mencukupi untuk "${product?.title || item.id}". Stok tersedia: ${product?.quantity || 0}`);
    }
    if (product.quantity - item.quantity <= 2) {
      hasLowStock = true;
    }
  }

  const cooldownHours = hasLowStock ? 1 : 6;
  const paymentExpiry = new Date(Date.now() + cooldownHours * 60 * 60 * 1000);

  // Voucher validation with lock and maxDiscount support
  let finalDiscount = 0;
  let finalVoucherId = null;
  if (voucherCode) {
    const vouchers = await tx.$queryRaw<any[]>`
      SELECT * FROM "Voucher" WHERE code = ${voucherCode.toUpperCase()} FOR UPDATE
    `;
    if (vouchers.length > 0) {
      const v = vouchers[0];
      if (v.isActive && new Date(v.expiryDate) >= new Date() && (!v.usageLimit || v.usedCount < v.usageLimit)) {
        const vType = v.type || v.discountType;
        if (vType === 'PERCENTAGE') {
          finalDiscount = (normalSubtotal * Number(v.discountValue)) / 100;
          if (v.maxDiscount && finalDiscount > Number(v.maxDiscount)) {
            finalDiscount = Number(v.maxDiscount);
          }
        } else {
          finalDiscount = Number(v.discountValue);
        }
        await tx.voucher.update({
          where: { id: v.id },
          data: { usedCount: { increment: 1 } }
        });
        finalVoucherId = v.id;
      }
    }
  }

  // Atomically decrement stock
  for (const item of items) {
    await tx.product.update({
      where: { id: item.id },
      data: { quantity: { decrement: item.quantity } }
    });
  }

  const newOrder = await tx.order.create({
    data: {
      orderId,
      userId: session ? session.userId : null,
      guestName: name,
      guestEmail: email,
      shippingName: name,
      shippingMobile: phone,
      shippingAddress: address,
      shippingProvince: province,
      shippingCity: city,
      shippingPostalCode: postalCode,
      shippingNote: note,
      paymentAmount: grossAmount,
      orderStatus: 'WAITING_FOR_PAYMENT',
      paymentStatus: 'UNPAID',
      paymentExpiry,
      voucherId: finalVoucherId,
      voucherCode: voucherCode || null,
      discountAmount: finalDiscount,
      orderItems: {
        create: orderItems.map(oi => ({
          productId: oi.productId,
          count: oi.count,
          price: oi.price
        }))
      }
    }
  });

  return { newOrder, cooldownHours };
});
```
3. Initialize Midtrans Snap with dynamic production flag and pass `duration: cooldownHours`.

- [ ] **Step 3: Run Vitest to verify checkout locking passes**
Run: `npm run test:run`
Expected: PASS.

---

### Task 3: Midtrans Webhook Idempotency, Real-Time Sync & Stock/Sold Rollback
**Files:**
- Modify: `app/api/webhook/midtrans/route.ts`
- Modify: `app/actions/order.ts:14-57` (cancelOrder action)
- Test: `tests/webhook-rollback.test.ts` (create test file)

**Interfaces:**
- Produces: Safe webhook endpoint handling `settlement` (increments `sold`) and `cancel`/`expire` (restores `quantity`, decrements `sold` if was paid, rolls back voucher).

- [ ] **Step 1: Write unit tests for webhook settlement and cancellation rollback**
Test file `tests/webhook-rollback.test.ts` checking:
1. `settlement` marks `PAID` + `PROCESSING` and increments `product.sold`.
2. `cancel` / `expire` marks `CANCELLED`, increments `product.quantity`, and decrements `voucher.usedCount`.
3. Cancelling a paid order decrements `product.sold` and restores `product.quantity`.

- [ ] **Step 2: Update `app/api/webhook/midtrans/route.ts`**
Implement the transactional settlement and rollback logic according to Spec Section 4.3.

- [ ] **Step 3: Update `cancelOrder` in `app/actions/order.ts`**
In `app/actions/order.ts`:
1. Allow cancellation if `orderStatus` is `WAITING_FOR_PAYMENT`, `PROCESSING`, or `PREPARING`.
2. Block cancellation if `orderStatus` is `IN_DELIVERY`, `DELIVERED`, or `COMPLETED`.
3. Wrap cancellation in a single Prisma transaction restoring `product.quantity`, decrementing `product.sold` (if order was paid), and rolling back voucher usage.

- [ ] **Step 4: Run tests to verify webhook and cancellation rollback**
Run: `npm run test:run`
Expected: PASS.

---

### Task 4: Payment Cooldown Page with Dynamic Urgency & Snap Retries
**Files:**
- Modify: `app/(store)/payment/[orderId]/page.tsx`
- Modify: `app/(store)/checkout/CheckoutClient.tsx:96-107`

**Interfaces:**
- Consumes: Dynamic `paymentExpiry` from `Order`.
- Produces: Reactive countdown timer and fixed voucher `useEffect` dependency loop.

- [ ] **Step 1: Fix infinite loop in `CheckoutClient.tsx`**
Update `useEffect` in `CheckoutClient.tsx` to depend on `appliedVoucher?.code` primitive rather than object reference.

- [ ] **Step 2: Redesign `app/(store)/payment/[orderId]/page.tsx`**
1. Display countdown timer calculated from `orderData.paymentExpiry`.
2. Add urgency banner when time remaining is under 1 hour.
3. Allow re-opening and clicking "Bayar Sekarang" to trigger Snap popup.
4. If expired (`remaining <= 0`), disable button, display *"Waktu pembayaran telah habis"*, and offer a link to re-order.

---

### Task 5: Sanitized Customer & Guest Order Tracking Channels
**Files:**
- Modify: `app/api/track-order/route.ts`
- Modify: `app/api/payment/[orderId]/route.ts`
- Modify: `app/actions/account.ts`

**Interfaces:**
- Consumes: Guest `orderId` + `email` or Member session.
- Produces: Safe order JSON objects without password hashes, OTPs, or reset tokens.

- [ ] **Step 1: Sanitize `/api/track-order/route.ts`**
Remove `user: true` query include and select only `{ user: { select: { name: true, email: true } } }`. Mask private address parts if necessary.

- [ ] **Step 2: Secure `/api/payment/[orderId]/route.ts`**
Verify that caller is either the logged-in owner or validate session before returning full address data.

---

### Task 6: Admin Fulfillment Stepper, Courier/Resi Enforcement & Return Claims
**Files:**
- Modify: `app/actions/admin-orders.ts`
- Modify: `app/admin/(dashboard)/orders/OrderListClient.tsx`
- Test: `tests/admin-fulfillment.test.ts`

**Interfaces:**
- Produces: Admin order stepper actions:
  - `startPreparingOrder(id)`
  - `shipOrder(id, courier, resi)`
  - `deliverOrder(id)`
  - `processReturn(id, resolution)`

- [ ] **Step 1: Write tests for admin fulfillment transitions**
Verify:
1. Transitioning to `IN_DELIVERY` strictly fails if `courier` or `resi` is empty.
2. `withAdminAuth` blocks unauthenticated calls.
3. Status transitions `PROCESSING` ➔ `PREPARING` ➔ `IN_DELIVERY` ➔ `DELIVERED` ➔ `COMPLETED`.

- [ ] **Step 2: Implement fulfillment actions in `app/actions/admin-orders.ts`**
Add status transition actions protected by `withAdminAuth`.

- [ ] **Step 3: Update `OrderListClient.tsx` UI**
1. Add status filter tabs: `Semua`, `Menunggu Pembayaran`, `Diproses`, `Disiapkan`, `Dalam Pengiriman`, `Terkirim`, `Selesai`, `Komplain/Retur`, `Dibatalkan`.
2. Add action buttons:
   - For `PROCESSING`: button "Siapkan Pesanan" (`PREPARING`).
   - For `PREPARING`: button "Kirim Pesanan" opening modal with Courier selector & Resi input (`IN_DELIVERY`).
   - For `IN_DELIVERY`: button "Tandai Terkirim" (`DELIVERED`).
   - For `RETURN_REQUESTED`: button "Proses Retur/Klaim" (`RETURNED` or `COMPLETED`).

---

### Task 7: Next.js Edge Middleware & Global Admin Security Guard
**Files:**
- Create: `middleware.ts` (rename / replace `proxy.ts`)
- Modify: `app/admin/(dashboard)/layout.tsx`
- Modify: `lib/cors.ts:43-48`

**Interfaces:**
- Produces: Global edge route protection for `/admin/*` routes redirecting unauthenticated traffic to `/admin/login`.

- [ ] **Step 1: Create `middleware.ts`**
Export `export async function middleware(request: NextRequest)` in the project root targeting `/admin/:path*` (except `/admin/login`).

- [ ] **Step 2: Update `AdminLayout`**
In `app/admin/(dashboard)/layout.tsx`, add server-side `redirect('/admin/login')` if token is missing or invalid.

- [ ] **Step 3: Fix CORS Subdomain Validation in `lib/cors.ts`**
Replace `origin.endsWith(allowed)` with exact host or strict dot-prefixed subdomain verification.

- [ ] **Step 4: Run full test suite & typecheck**
Run: `npx tsc --noEmit` and `npm run test:run`
Expected: 0 type errors, all tests pass.
