# Client Design System Modernization & Standardization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: 
1. Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
2. Use tasteskill v2 for design patterns preference and use it as single truth of principles.

**Goal:** Menstandarisasi dan memodernisasi komponen UI storefront client, skala corner radius, token warna & background, serta menyelaraskan seluruh alur transaksi (khususnya alur pembayaran Midtrans) agar mematuhi standar *design system pattern* yang konsisten dan anti-slop.

**Architecture:** Melakukan standarisasi bertahap: (1) Menyelaraskan halaman `payment/[orderId]/pending` dengan saudara kandungnya `payment/[orderId]` dan `payment/[orderId]/success`; (2) Menstandarisasi token radius dan warna background antarmuka transaksi; (3) Meningkatkan adopsi komponen inti `components/ui/` (`Button`, `Input`, `Badge`) menggantikan raw ad-hoc JSX; (4) Konsolidasi keselarasan ikonografi antar touchpoint customer.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (@theme), `@phosphor-icons/react`, `lucide-react`, Vitest.

---

## Global Constraints & Design System Tokens

* **Background Foundation:** Halaman transaksi/checkout menggunakan token neutral warm `bg-[#fcfbf9]` (bukan `bg-gray-50` yang kontras dingin).
* **Shape Consistency Lock:**
  * Container Cards: `rounded-xl border border-gray-200 shadow-2xs`
  * Primary / Secondary Action Buttons: `rounded-xl` (atau `rounded-lg` pada compact mode) dengan feedback tactile `active:scale-[0.98]`
  * Form Inputs & Selects: `rounded-xl border border-gray-300`
  * Status Badges / Pills: `rounded-full text-xs font-semibold`
* **Color Lock:** Primary accent mengacu pada token Tailwind v4 `--color-primary-green` (`#00AA5B`) dan hover `--color-primary-green-hover` (`#285430`). Tidak ada gradien amber tebal yang menabrak hierarki visual.
* **Component Abstraction:** Hindari raw `<button className="...">` dan raw `<input className="...">` pada alur transaksi; gunakan komponen dari `@/components/ui/Button` dan `@/components/ui/Input`.

---

## Task Breakdown

### Task 1: Redesign & Standardize Payment Pending Page (`payment/[orderId]/pending`)

**Files:**
- Modify: `app/(store)/payment/[orderId]/pending/page.tsx`
- Test: Manual visual check + `npm run test:run`

**Interfaces:**
- Consumes: `@/components/ui/Button`, `lucide-react` (Clock, ArrowRight, AlertCircle, ShieldCheck, ArrowLeft, RefreshCw), `/api/payment/[orderId]`
- Produces: Pola layout konsisten dengan `payment/[orderId]/page.tsx` dan `payment/[orderId]/success/page.tsx`.

- [x] **Step 1: Audit and clean redundant styling & types**
  - Ganti background halaman dari `bg-gray-50` ke `bg-[#fcfbf9]`.
  - Buat interface TypeScript yang rapi untuk `OrderData` menggantikan `any`.
  - Hapus class gradien tebal `bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl` dan ganti dengan kartu countdown presisi dengan border `border-gray-200` atau aksen warm amber yang selaras (`bg-amber-50/70 border-amber-200 text-amber-900`).

- [x] **Step 2: Align card structure with payment & success sibling pages**
  - Gunakan `rounded-xl border border-gray-200 shadow-2xs` untuk seluruh kartu informasi.
  - Rapikan rincian pesanan (ID Pesanan, Total Pembayaran, Status) dengan format tabel ringkasan simetris.
  - Tambahkan banner instruksi transfer yang elegan dan footnote trust seal (`Transaksi Resmi & Terenkripsi Aman`).

- [x] **Step 3: Refactor action button to use Design System `<Button>`**
  - Import `Button` dari `@/components/ui/Button`.
  - Ganti raw `<button>` dengan `<Button variant="primary" size="lg" className="w-full h-12" isLoading={isPaymentLoading} rightIcon={<ArrowRight size={15} />}>Bayar Sekarang</Button>`.

- [x] **Step 4: Verify build & tests**
  - Jalankan `npm run test:run` dan pastikan tidak ada error kompilasi TypeScript.

---

### Task 2: Standardize Corner Radius & Token Hierarchy across Store UI

**Files:**
- Modify: `components/ui/Button.tsx` (ensure size & radius consistency)
- Modify: `components/ui/Input.tsx` (ensure focus rings & padding tokens match)
- Modify: `app/globals.css` (verify @theme utility tokens)

**Interfaces:**
- Consumes: Tailwind v4 theme variables
- Produces: Token radius dan ring focus yang seragam untuk semua form dan tombol.

- [x] **Step 1: Audit Button radius & active feedback**
  - Pastikan `Button.tsx` menyediakan variasi konsisten (`rounded-xl` default, padding seimbang, active tactile `active:scale-[0.98]`).
- [x] **Step 2: Audit Input focus & error states**
  - Pastikan `Input.tsx` menggunakan `focus:ring-primary-green focus:border-primary-green` dan radius `rounded-xl`.
- [x] **Step 3: Run Vitest tests**
  - Jalankan `npm run test:run` untuk memastikan tidak ada regresi komponen UI.

---

### Task 3: Checkout Page Refactoring to Consume Core Design System Components

**Files:**
- Modify: `app/(store)/checkout/CheckoutClient.tsx`
- Test: `tests/orders-flow.test.ts`, `tests/cart-and-wishlist.test.ts`

**Interfaces:**
- Consumes: `@/components/ui/Button`, `@/components/ui/Input`, `@/components/ui/Badge`
- Produces: Checkout UI yang seragam dengan alur pembayaran, input tersentralisasi dengan label & helper validation standar.

- [x] **Step 1: Replace raw form inputs with `<Input>` and `<Select>`**
  - Ubah input Nama, Email, Telepon, Kota, Kode Pos menjadi komponen `<Input />`.
  - Ubah textarea alamat menjadi `<Textarea />`.
- [x] **Step 2: Replace submit & voucher buttons with `<Button>`**
  - Tombol cek voucher dan tombol submit pembayaran menggunakan `<Button variant="primary">`.
- [x] **Step 3: Run test suite**
  - Jalankan `npm run test:run`.

---

### Task 4: Iconography & Visual Assets Consistency Lock

**Files:**
- Audit: Component tree dari `/cart` -> `/checkout` -> `/payment`
- Modify: Pastikan tidak ada benturan visual antara `@phosphor-icons/react` dan `lucide-react` pada alur checkout yang sama.

- [x] **Step 1: Standardize icon stroke width**
  - Pastikan semua icon Lucide di alur pembayaran dan checkout menggunakan `strokeWidth={1.75}` atau `2.0` yang seragam.
- [x] **Step 2: Audit empty and loading states**
  - Gunakan skeleton loader atau spinner yang konsisten di semua halaman transaksi.

---

## Execution Options

Rencana kerja di atas siap dieksekusi melalui dua opsi:
1. **Subagent-Driven Execution (Recommended):** Setiap task dikerjakan secara modular dan diverifikasi per batch.
2. **Inline Execution:** Dikerjakan langsung langkah demi langkah dalam sesi ini dengan checkpoint verifikasi.
