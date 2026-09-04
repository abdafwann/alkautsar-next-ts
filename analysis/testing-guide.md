# 📋 Testing Guide — Alkautsar E-Commerce

> **Project:** Alkautsar Herbal E-Commerce (Next.js 16 + Prisma + Midtrans)
> **Role:** Solo Fullstack Developer
> **Existing Tests:** 21 test files, 161+ tests (Vitest)
> **Goal:** Production-ready validation via white box + black box testing

---

## Execution Flow Overview

```
Phase 1: White Box — Unit Tests (Automated)
  └── Server actions, utilities, business logic
        ↓
Phase 2: White Box — Integration Tests (Automated)
  └── Prisma transactions, API routes, webhook handlers
        ↓
Phase 3: Black Box — Functional Tests (Automated + Manual)
  └── Per-module feature validation
        ↓
Phase 4: Black Box — E2E Tests (Automated)
  └── Complete user journeys via Playwright
        ↓
Phase 5: Black Box — Final Validation (Manual)
  └── Payment gateway, real device, security, UX review
```

---

## Phase 1: White Box — Unit Tests `🤖 AUTOMATED`

> **Tool:** Vitest
> **Scope:** Setiap function/module diuji secara terisolasi dengan mock

### 1.1 Server Actions (`app/actions/`)

| File | Status | Test Cases |
|---|---|---|
| `cart.ts` | ✅ Sudah ada | upsert behavior, stock check, quantity capping |
| `order.ts` | ⚠️ Perlu ditambah | `cancelOrder` — reason passthrough, fallback default, guard clauses, transaction rollback |
| `catalog.ts` | ✅ Partial | search, filter. **Tambah:** pagination edge cases, empty results |
| `auth.ts` | ✅ Sudah ada | login, register |
| `emailAuth.ts` | ✅ Sudah ada | email verification flow |
| `voucher.ts` | ❌ Belum ada | `applyVoucher` — valid code, expired, max usage, min purchase |
| `wishlist.ts` | ✅ Partial | add/remove. **Tambah:** duplicate handling |
| `invoice.ts` | ✅ Sudah ada | generation, formatting |
| `account.ts` | ❌ Belum ada | `updateProfile` — sanitization, validation |
| `admin-orders.ts` | ✅ Sudah ada | status updates, resi input |
| `admin-vouchers.ts` | ❌ Belum ada | CRUD voucher, validation rules |
| `admin-management.ts` | ❌ Belum ada | admin registration, role guard |
| `upload.ts` | ✅ Sudah ada | file validation, size limits |
| `notifications.ts` | ❌ Belum ada | notification creation, read/unread toggle |
| `banner.ts` | ❌ Belum ada | CRUD banner |
| `articles.ts` | ❌ Belum ada | CRUD articles, slug generation |
| `store-frontend.ts` | ❌ Belum ada | store config fetch |
| `admin-reports.ts` | ✅ Sudah ada | report generation |
| `admin-customers.ts` | ❌ Belum ada | customer listing, search |

### 1.2 Library/Utilities (`lib/`)

| File | Status | Test Cases |
|---|---|---|
| `validation/` | ✅ Sudah ada | input sanitization (3 phases) |
| `utils.ts` | ✅ Sudah ada | formatRupiah, formatDate, etc |
| `constants.ts` | ✅ Sudah ada | constant values |
| `order-transition.ts` | ✅ Sudah ada | Midtrans status mapping |
| `sanitize.ts` | ✅ Covered in sanitization tests | XSS prevention |
| `ratelimit.ts` | ✅ Sudah ada | rate limiter logic |
| `auth-guard.ts` | ❌ Belum ada | `requireAdmin`, `requireAuth` guards |
| `order-security.ts` | ❌ Belum ada | order ownership validation |
| `prisma-context.ts` | ✅ Sudah ada | RLS context |
| `cors.ts` | ❌ Belum ada | CORS header validation |
| `ip-block.ts` | ❌ Belum ada | IP blocking logic |
| `monitoring.ts` | ❌ Belum ada | health check, metrics |

### 1.3 Component Logic (pure logic only, no DOM)

| Component | Test Cases |
|---|---|
| `OrdersListClient.tsx` | `getStatusConfig` returns correct `canCancel` per status, `CANCEL_REASONS` content validation, `isConfirmDisabled` derived state logic |
| `ProductCard.tsx` | `isOutOfStock` / `isLowStock` classification |
| Cart Store (Zustand) | add, remove, update quantity, clear, sync state |

---

## Phase 2: White Box — Integration Tests `🤖 AUTOMATED`

> **Tool:** Vitest + Prisma test database (SQLite atau PostgreSQL test instance)
> **Scope:** Interaksi antar-module dan database

### 2.1 Database Transactions

| Test Case | Apa Yang Diverifikasi |
|---|---|
| Cancel order (paid) | Stock di-increment, sold di-decrement, voucher usedCount di-decrement — **semua dalam 1 transaksi** |
| Cancel order (unpaid) | Stock di-increment, sold TIDAK berubah, voucher usedCount di-decrement |
| Cancel order + DB failure | Jika salah satu step gagal, **semua rollback** (stock tidak berubah) |
| Checkout + stock deduction | Stock berkurang sesuai quantity, sold bertambah |
| Concurrent checkout (produk stok 1) | Hanya 1 yang berhasil, yang lain gagal dengan error stok habis |
| Cart upsert | Record baru jika belum ada, update jika sudah ada |

### 2.2 API Routes (`app/api/`)

| Route | Test Cases |
|---|---|
| `POST /api/checkout` | Valid checkout → order created + snap token returned |
| `POST /api/webhook` | Valid Midtrans signature → order status updated; Invalid signature → rejected |
| `POST /api/webhook` (idempotent) | Same notification sent 2x → order only updated once |
| `POST /api/payment` | Payment status sync with Midtrans Core API |
| `GET /api/health` | Returns 200 + DB connection status |
| `GET /api/track-order` | Valid order ID → status returned; Invalid → 404 |

### 2.3 Webhook Security

| Test Case | Expected |
|---|---|
| Valid Midtrans signature header | Request processed |
| Invalid/missing signature | Request rejected (403) |
| Tampered payload | Signature mismatch → rejected |
| Replay attack (same order_id, different status) | Only processes if status is a valid transition |

---

## Phase 3: Black Box — Functional Tests `🤖 + 🖐️`

> Per-module feature testing dari perspektif pengguna
> Prioritas: **Critical Path dulu** (yang langsung berdampak ke revenue)

### 3.1 Authentication `🤖 AUTOMATED`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| A1 | Register dengan email valid | 🤖 | Akun terbuat, redirect ke verifikasi |
| A2 | Register dengan email sudah terdaftar | 🤖 | Error: "Email sudah terdaftar" |
| A3 | Login dengan credentials benar | 🤖 | Redirect ke homepage, session aktif |
| A4 | Login dengan password salah | 🤖 | Error: "Email atau password salah" |
| A5 | Akses `/account` tanpa login | 🤖 | Redirect ke `/login` |
| A6 | Akses `/admin` tanpa role admin | 🤖 | Redirect/403 forbidden |
| A7 | Session expired → akses protected page | 🤖 | Redirect ke login |
| A8 | Logout → session cleared | 🤖 | Cookie dihapus, redirect |

### 3.2 Katalog Produk `🤖 AUTOMATED`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| C1 | Homepage load → produk tampil | 🤖 | Produk cards rendered dengan harga, gambar |
| C2 | Produk stok = 0 → badge "Stok Habis" | 🤖 | Badge tampil, tombol disabled |
| C3 | Produk stok ≤ 5 → badge "Stok Terbatas" | 🤖 | Badge warning tampil |
| C4 | Search produk by keyword | 🤖 | Hasil sesuai keyword |
| C5 | Search keyword tidak ada | 🤖 | Empty state "Tidak ditemukan" |
| C6 | Filter by category | 🤖 | Hanya produk dari kategori tsb |
| C7 | Halaman produk detail → info lengkap | 🤖 | Judul, deskripsi, harga, gambar, stok |

### 3.3 Keranjang (Cart) `🤖 AUTOMATED`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| K1 | Add produk ke cart | 🤖 | Item muncul di cart, counter navbar +1 |
| K2 | Add produk stok 0 → ditolak | 🤖 | Toast error, tidak ditambahkan |
| K3 | Update quantity via +/- | 🤖 | Quantity berubah, total recalculated |
| K4 | Update quantity melebihi stok → dicap ke max | 🤖 | Quantity = stok tersedia |
| K5 | Remove item dari cart | 🤖 | Item hilang, counter berkurang |
| K6 | Cart kosong → empty state | 🤖 | Pesan "Keranjang kosong" |
| K7 | Guest add to cart → login → cart sync | 🤖 | Item dari guest state tersinkron ke DB |
| K8 | 2 tab buka cart → update di tab A → tab B refresh | 🖐️ Manual | Tab B menampilkan data terbaru |

### 3.4 Checkout & Pembayaran `🤖 + 🖐️`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| P1 | Checkout dengan alamat lengkap | 🤖 | Order created, snap token returned |
| P2 | Checkout tanpa alamat → validasi | 🤖 | Error: field wajib |
| P3 | Apply voucher valid | 🤖 | Diskon teraplikasi, total berkurang |
| P4 | Apply voucher expired/habis | 🤖 | Error: "Voucher tidak valid" |
| P5 | Apply voucher min. purchase tidak terpenuhi | 🤖 | Error: "Minimum belanja belum tercapai" |
| P6 | Midtrans popup → bayar sukses | 🖐️ Manual | Toast success, status → PAID |
| P7 | Midtrans popup → bayar pending | 🖐️ Manual | Toast pending, status tetap WAITING |
| P8 | Midtrans popup → ditutup user | 🖐️ Manual | Toast warning, order tetap WAITING |
| P9 | Checkout produk yang stok habis saat proses | 🤖 | Error: "Stok tidak mencukupi" |
| P10 | Concurrent checkout produk stok 1 oleh 2 user | 🤖 | Hanya 1 berhasil |

### 3.5 Pembatalan Pesanan `🤖 AUTOMATED`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| B1 | Cancel order status WAITING_FOR_PAYMENT | 🤖 | Status → CANCELLED, stok restored |
| B2 | Cancel order status PROCESSING (paid) | 🤖 | Status → CANCELLED, stok + sold restored |
| B3 | Cancel order status IN_DELIVERY → ditolak | 🤖 | Error: "Tidak dapat dibatalkan" |
| B4 | Cancel modal → pilih alasan predefined | 🤖 | Reason tersimpan di DB `cancellationReason` |
| B5 | Cancel modal → pilih "Lainnya" → isi teks | 🤖 | Custom reason tersimpan di DB |
| B6 | Cancel modal → "Lainnya" + textarea kosong | 🤖 | Tombol "Ya, Batalkan" disabled |
| B7 | Cancel modal → klik "Kembali" | 🤖 | Modal tertutup, order tidak berubah |
| B8 | Cancel modal → klik backdrop | 🤖 | Modal tertutup |
| B9 | Cancel order milik user lain | 🤖 | Error: "Akses ditolak" |
| B10 | Cancel + voucher → voucher usage restored | 🤖 | `usedCount` di-decrement |

### 3.6 Riwayat Pesanan `🤖 AUTOMATED`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| R1 | Halaman orders → semua pesanan tampil | 🤖 | List orders dengan status badge |
| R2 | Filter tab "Belum Bayar" | 🤖 | Hanya order WAITING_FOR_PAYMENT |
| R3 | Search by invoice ID | 🤖 | Hasil sesuai invoice |
| R4 | Klik "Rincian" → modal detail | 🤖 | Info lengkap: alamat, produk, total |
| R5 | Order COMPLETED → tombol "Faktur" | 🤖 | Link ke `/invoice/{id}` |
| R6 | Order WAITING → tombol "Bayar Sekarang" | 🤖 | Midtrans popup terbuka |
| R7 | Order CANCELLED → tidak ada tombol aksi | 🤖 | Hanya status badge "Dibatalkan" |

### 3.7 Admin Panel `🤖 + 🖐️`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| D1 | Dashboard load → statistik tampil | 🤖 | Revenue, total orders, customers |
| D2 | CRUD Produk — create | 🤖 | Produk tersimpan dengan semua field |
| D3 | CRUD Produk — update stok | 🤖 | Stok berubah, reflected di frontend |
| D4 | CRUD Produk — delete | 🤖 | Produk terhapus (atau soft delete) |
| D5 | Update order status → resi | 🤖 | Status berubah, resi tersimpan |
| D6 | Export laporan penjualan | 🖐️ Manual | File CSV/PDF terdownload dengan data benar |
| D7 | CRUD Voucher | 🤖 | Create, edit, activate/deactivate |
| D8 | Customer list + search | 🤖 | Data customer tampil, searchable |
| D9 | Admin logs → audit trail | 🤖 | Setiap aksi admin tercatat |
| D10 | Manage articles (CRUD) | 🤖 | Create, edit, delete, preview |

### 3.8 Invoice & Shipping Label `🖐️ MANUAL`

| # | Test Case | Type | Expected Result |
|---|---|---|---|
| I1 | Generate invoice → layout benar | 🖐️ Manual | Logo, data order, total semua tampil |
| I2 | Print invoice → print preview | 🖐️ Manual | Format print-friendly, tidak terpotong |
| I3 | Shipping label → data pengiriman | 🖐️ Manual | Nama, alamat, kurir, resi tampil benar |

---

## Phase 4: Black Box — E2E Tests `🤖 AUTOMATED`

> **Tool:** Playwright
> **Scope:** Complete user journeys end-to-end di real browser

### Critical User Journeys

```
E2E-1: Happy Path Purchase
  Guest → Browse → Add to Cart → Register → Login → Cart Synced 
  → Checkout (alamat + voucher) → *skip Midtrans* → Order Created 
  → Verify di /account/orders

E2E-2: Cancel Order Flow
  Login → /account/orders → Click cancel icon → Modal opens 
  → Select reason → Confirm → Toast success → Order status CANCELLED 
  → Verify stok restored (via API check)

E2E-3: Stock Boundary
  Admin set stok = 1 → User A add to cart → User A checkout 
  → User B browse same product → Badge "Stok Habis" shown 
  → User B add to cart → Rejected

E2E-4: Admin Order Management
  Admin login → Orders → Update status to PREPARING → Add resi 
  → Update to IN_DELIVERY → User check /account/orders → Status updated

E2E-5: Search & Filter
  Browse /store → Search keyword → Results shown 
  → Filter by category → Results filtered → Click product → Detail page

E2E-6: Auth Guard
  Access /account without login → Redirected to /login 
  → Login → Redirected back to /account
  Access /admin without admin role → Rejected

E2E-7: Voucher Flow
  Admin create voucher → User checkout → Apply voucher 
  → Discount applied → Complete order → Voucher usedCount +1
  → Another user tries same voucher at max usage → Rejected
```

---

## Phase 5: Final Manual Validation `🖐️ MANUAL`

> Dilakukan **sekali** sebelum go-live. Tidak bisa di-automated.

### 5.1 Payment Gateway (Midtrans Sandbox)

| # | Test Case |
|---|---|
| M1 | Pembayaran QRIS → scan → sukses → webhook diterima → status PAID |
| M2 | Pembayaran Bank Transfer → VA generated → bayar → sukses |
| M3 | Pembayaran expired (biarkan timeout) → status auto-cancel |
| M4 | Pembayaran gagal/ditolak → error handling proper |
| M5 | Double payment attempt → idempotent, tidak double charge |

### 5.2 Cross-Browser & Device

| # | Test Case |
|---|---|
| V1 | Chrome Desktop — full walkthrough |
| V2 | Safari Desktop (macOS) — layout check |
| V3 | Firefox Desktop — layout + functionality |
| V4 | Chrome Android — responsive, touch interactions |
| V5 | Safari iOS — responsive, touch, scroll behavior |
| V6 | Tablet landscape/portrait — layout adaptasi |

### 5.3 Security Checklist

| # | Test Case |
|---|---|
| S1 | Akses `/admin` langsung tanpa login → blocked |
| S2 | Manipulasi URL `/account/orders?id=xxx` (order milik user lain) → akses ditolak |
| S3 | XSS injection di search bar, form input, catatan pengiriman |
| S4 | SQL injection attempt di input fields → sanitized |
| S5 | CSRF: submit form dari domain lain → rejected |
| S6 | Rate limiting: spam API call → throttled setelah limit |
| S7 | File upload: upload `.exe`, `.php` → rejected |
| S8 | Price manipulation: ubah harga di client → server validate actual price |

### 5.4 Performance

| # | Test Case | Target |
|---|---|---|
| L1 | Lighthouse Performance Score | ≥ 80 |
| L2 | Lighthouse Accessibility Score | ≥ 90 |
| L3 | First Contentful Paint (FCP) | < 2s |
| L4 | Largest Contentful Paint (LCP) | < 2.5s |
| L5 | Time to Interactive (TTI) | < 3s |
| L6 | Total page weight (homepage) | < 2MB |

---

## Tools Setup Summary

| Tool | Purpose | Phase |
|---|---|---|
| **Vitest** (sudah ada) | Unit + Integration tests | Phase 1–2 |
| **Playwright** (perlu setup) | E2E browser tests | Phase 4 |
| **Lighthouse CI** (optional) | Performance audit automation | Phase 5 |
| **Prisma test DB** | Isolated DB for integration tests | Phase 2 |

---

## Execution Checklist

### Pre-Testing
- [ ] Buat test database terpisah (jangan pakai production DB)
- [ ] Setup Midtrans sandbox credentials
- [ ] Setup Playwright jika belum ada

### Phase 1 — Unit Tests `🤖`
- [ ] Run existing 21 test files → all pass
- [ ] Tambah unit tests untuk: `voucher.ts`, `account.ts`, `admin-vouchers.ts`, `notifications.ts`, `auth-guard.ts`
- [ ] Tambah cancel modal logic tests: `CANCEL_REASONS` validation, `isConfirmDisabled` states
- [ ] Target: ≥80% coverage pada `app/actions/` dan `lib/`

### Phase 2 — Integration Tests `🤖`
- [ ] Cancel order transaction atomicity (stock + sold + voucher rollback)
- [ ] Webhook idempotency (same notification 2x)
- [ ] Webhook signature validation
- [ ] Concurrent checkout race condition
- [ ] Cart upsert (update existing vs create new)

### Phase 3 — Functional Tests `🤖 + 🖐️`
- [ ] Auth flow (A1–A8)
- [ ] Katalog produk (C1–C7)
- [ ] Keranjang (K1–K8)
- [ ] Checkout & Payment (P1–P10)
- [ ] Pembatalan (B1–B10)
- [ ] Riwayat Pesanan (R1–R7)
- [ ] Admin Panel (D1–D10)
- [ ] Invoice & Label (I1–I3) 🖐️

### Phase 4 — E2E Tests `🤖`
- [ ] E2E-1: Happy path purchase
- [ ] E2E-2: Cancel order flow
- [ ] E2E-3: Stock boundary
- [ ] E2E-4: Admin order management
- [ ] E2E-5: Search & filter
- [ ] E2E-6: Auth guard
- [ ] E2E-7: Voucher flow

### Phase 5 — Final Manual `🖐️`
- [ ] Midtrans sandbox real payment (M1–M5)
- [ ] Cross-browser/device (V1–V6)
- [ ] Security checklist (S1–S8)
- [ ] Performance audit (L1–L6)

---

## Priority Order (untuk Solo Dev)

> [!IMPORTANT]
> Kamu tidak harus mengerjakan semua sekaligus. Berikut urutan prioritas:

```
🔴 P0 — Must Have (blocking production)
├── Phase 1: Unit tests untuk cancelOrder, voucher, checkout
├── Phase 2: Transaction atomicity, webhook idempotency
├── Phase 5: Midtrans sandbox real payment test
└── Phase 5: Security checklist (S1–S8)

🟡 P1 — Should Have (high impact)
├── Phase 3: Functional tests (Cart, Checkout, Cancel — K1-K7, P1-P5, B1-B10)
├── Phase 4: E2E-1 (happy path) + E2E-2 (cancel flow)
└── Phase 5: Performance audit

🟢 P2 — Nice to Have (quality polish)
├── Phase 1: Remaining unit tests (banner, articles, notifications)
├── Phase 3: Admin panel functional tests
├── Phase 4: Remaining E2E journeys
└── Phase 5: Cross-browser/device testing
```
