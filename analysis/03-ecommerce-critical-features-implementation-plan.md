# E-Commerce Critical Features Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.  
> **Spec Document:** [03-ecommerce-critical-features-audit-and-fix-plan.md](file:///e:/Alkautsar-Upgrade/ecommerce-nextjs/analysis/03-ecommerce-critical-features-audit-and-fix-plan.md)  
> **Goal:** Remediate 4 critical P0 functional bugs, unify payment/stock status transitions, eliminate remaining `lucide-react` icons in transaction flows (P1), and enhance admin complaint observability (P2).

---

### Task 1: Catalog Search Integration (`q` parameter) [P0]
- [x] **Step 1: Write failing unit test for `getShopProducts` with `query` search**
- [x] **Step 2: Update `getShopProducts` in `app/actions/catalog.ts` with search query `OR` filter**
- [x] **Step 3: Update `app/(store)/shop/page.tsx` to extract `q` parameter from `searchParams`**
- [x] **Step 4: Update `components/shop/ProductGridServer.tsx` to handle `query`, pagination URL with `q`, and active search indicator**
- [x] **Step 5: Run tests and verify search functionality**

---

### Task 2: Fix Customer Order History Tab Filter & Counts [P0]
- [x] **Step 1: Write test for order filter predicate**
- [x] **Step 2: Update `OrdersListClient.tsx` tab filters (`PAID` -> `paymentStatus === 'PAID' && orderStatus === 'PROCESSING'`, `PROCESSING` -> `orderStatus === 'PREPARING'`)**
- [x] **Step 3: Update `counts` calculations in `OrdersListClient.tsx`**
- [x] **Step 4: Verify customer order history tab filtering**

---

### Task 3: Store & Validate Complaint / Return Reason in DB [P0]
- [x] **Step 1: Write/update test for `requestOrderComplaint` in `tests/orders-flow.test.ts`**
- [x] **Step 2: Update `requestOrderComplaint` in `app/actions/order.ts` to sanitize and persist `cancellationReason`**
- [x] **Step 3: Verify complaint persistence in database**

---

### Task 4: Unified Order Payment & Stock Transition Handler [P0]
- [x] **Step 1: Create `lib/order-transition.ts` with `processOrderPaymentTransition`**
- [x] **Step 2: Integrate `processOrderPaymentTransition` into Midtrans Webhook (`app/api/webhook/midtrans/route.ts`)**
- [x] **Step 3: Integrate into `syncPaymentStatus` in `app/actions/order.ts`**
- [x] **Step 4: Integrate into auto-sync in `app/api/payment/[orderId]/route.ts`**
- [x] **Step 5: Write unit tests for transition handler and run tests**

---

### Task 5: CheckoutClient Icon Harmonization & Script Cleanup [P1 + P2]
- [x] **Step 1: Replace all `lucide-react` imports with `@phosphor-icons/react` in `app/(store)/checkout/CheckoutClient.tsx`**
- [x] **Step 2: Remove redundant `snap.js` `<Script ... />` and `snapJsUrl` in `CheckoutClient.tsx`**

---

### Task 6: Payment Pages Icon Harmonization [P1]
- [x] **Step 1: Migrate icons in `app/(store)/payment/[orderId]/page.tsx`**
- [x] **Step 2: Migrate icons in `app/(store)/payment/[orderId]/pending/page.tsx`**
- [x] **Step 3: Migrate icons in `app/(store)/payment/[orderId]/success/page.tsx`**

---

### Task 7: TrackOrderClient Icon Harmonization [P1]
- [x] **Step 1: Migrate all 18+ `lucide-react` icons in `app/(store)/track-order/TrackOrderClient.tsx` to `@phosphor-icons/react`**

---

### Task 8: SearchInput Component Standardization [P1]
- [x] **Step 1: Replace `Search` in `components/ui/SearchInput.tsx` with `MagnifyingGlass` and refine styling**

---

### Task 9: Admin Order Cancellation & Complaint Observability [P2]
- [x] **Step 1: Pass `cancellationReason` in `app/actions/admin-orders.ts` serializer**
- [x] **Step 2: Update `Order` interface and add cancellation/complaint callout in `OrderListClient.tsx` modal**

---

### Task 10: Full Regression Testing & Next.js Build Verification
- [x] **Step 1: Run `npm run test:run` and verify 100% tests pass (153 passed)**
- [x] **Step 2: Run `npm run build` and ensure zero TypeScript / lint errors (27/27 routes compiled)**
