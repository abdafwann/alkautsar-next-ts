# 📋 Phase 5: Final Manual Validation Guide

> **Project:** Alkautsar Herbal E-Commerce
> **Prerequisites:** Phases 1–4 Automated Tests (37 files, 322 tests) are **100% Passing** ✅
> **Goal:** Validate real-world payments, UI responsiveness across devices, end-to-end security, and performance before go-live.

---

## 5.1 Payment Gateway Simulation (Midtrans Sandbox)

Use the [Midtrans Payment Simulator](https://simulator.sandbox.midtrans.com/) to test real transactions.

| # | Scenario | Steps | Expected Outcome |
|---|---|---|---|
| **M1** | **QRIS Payment** | 1. Checkout a product on `http://localhost:3000`<br>2. Select QRIS in Midtrans Snap popup<br>3. Scan or simulate success via Midtrans Simulator | Toast "Pembayaran Berhasil", status becomes `PROCESSING` / `PAID`, cart is cleared. |
| **M2** | **Bank Transfer (BCA/BNI/Mandiri VA)** | 1. Choose Bank Transfer<br>2. Copy VA number<br>3. Pay via Midtrans Simulator | Order status transitions to `PROCESSING` automatically upon webhook arrival. |
| **M3** | **Payment Timeout / Expiry** | 1. Create order and close Snap popup<br>2. Let cooldown expire (or trigger via Midtrans Simulator `expire`) | Status becomes `CANCELLED`, inventory stock is restored. |
| **M4** | **Payment Cancelled / Denied** | 1. Trigger `deny` or `cancel` in Midtrans simulator | Status transitions to `CANCELLED` and stock is released. |
| **M5** | **Double Payment / Idempotency** | 1. Send duplicate settlement webhook | System responds 200 "Already paid" without double decrementing stock. |

---

## 5.2 Cross-Browser & Device Responsiveness

Test the application across key viewports:

| # | Browser / Device | Checkpoints |
|---|---|---|
| **V1** | **Chrome Desktop** | Full purchase journey, order cancel modal, admin dashboard tables and charts. |
| **V2** | **Safari Desktop / iOS** | Sticky navbar blur effect, sticky bottom bars on checkout, smooth scrolling. |
| **V3** | **Firefox Desktop** | Font rendering, form inputs, button hover transitions. |
| **V4** | **Mobile (Android/iOS)** | Hamburger menu, bottom navigation, touch targets ($\ge 48\text{px}$), cart drawer gestures. |
| **V5** | **Tablet (iPad / Portrait)** | Responsive grid switching (1 col mobile $\rightarrow$ 2-3 col tablet $\rightarrow$ 4-5 col desktop). |

---

## 5.3 Security Verification Checklist

| # | Checkpoint | How to Verify | Expected Result |
|---|---|---|---|
| **S1** | **Admin Route Guard** | Navigate to `http://localhost:3000/admin` in Incognito | Automatically redirected to `/admin/login`. |
| **S2** | **Order Ownership Isolation** | Visit `/account/orders` or `/api/payment/{other_order_id}` with another user's session | Non-owner cannot access or cancel the order; public view masks PII (`***@gmail.com`, `0812****789`). |
| **S3** | **XSS Injection Sanity** | Input `<script>alert('xss')</script>` in search, shipping note, or profile name | Sanitized safely; no JavaScript execution. |
| **S4** | **Brute-Force Rate Limiting** | Submit wrong password on `/login` or `/admin/login` 6 times rapidly | Throttled with 429 / "Terlalu banyak percobaan". |
| **S5** | **Client-Side Price Tampering** | Manipulate client state payload with price `Rp 1` | Server fetches authoritative product prices from DB and rejects tampered total. |

---

## 5.4 Performance & Core Web Vitals (Lighthouse)

Run Chrome DevTools $\rightarrow$ **Lighthouse** on the Homepage (`/`) and Store page (`/store`):

| Metric | Target | Description |
|---|---|---|
| **Performance Score** | $\ge 80$ | Overall loading & rendering speed |
| **Accessibility Score** | $\ge 90$ | ARIA labels, semantic markup, color contrast |
| **Largest Contentful Paint (LCP)** | $< 2.5\text{s}$ | Hero banner and main product grid render time |
| **First Contentful Paint (FCP)** | $< 1.8\text{s}$ | Initial DOM content render |
| **Cumulative Layout Shift (CLS)** | $< 0.1$ | Visual stability (no layout jumping) |

---

## ✅ Final Go-Live Readiness Sign-off

- [ ] All 322 automated tests passing (`npm run test:run` & `npm run test:e2e`)
- [ ] Midtrans production credentials configured in `.env` (`MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION=true`)
- [ ] Resend email provider configured (`RESEND_API_KEY`)
- [ ] Database backup / point-in-time recovery active
