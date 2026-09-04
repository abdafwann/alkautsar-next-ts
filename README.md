# Alkautsar E-Commerce

Platform e-commerce toko herbal tradisional Alkautsar. Dibangun dengan Next.js 16 (App Router), TypeScript, PostgreSQL via Prisma ORM, dan integrasi payment gateway Midtrans (Snap & Webhook).

---

## Tech Stack

- **Framework:** Next.js 16 (React 19, App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS v4, Lucide Icons, Phosphor Icons
- **Database & ORM:** PostgreSQL (Supabase pooler) + Prisma 7
- **Payment Gateway:** Midtrans (Snap Pop-up, Core API Status, Webhook Handler)
- **State Management:** Zustand (Cart & client state)
- **Rate Limiting & Cache:** Upstash Redis
- **Media Upload:** Cloudinary
- **Transactional Email:** Resend
- **Testing:** Vitest (Unit, Integration, Functional) + Playwright (E2E)

---

## Arsitektur & Fitur Utama

- **Katalog & Checkout:**
  - Dynamic product search, category filter, dan sorting.
  - Cart persistensi dengan proteksi validasi stok real-time saat checkout.
  - Sistem kupon/voucher diskon dengan kalkulasi presisi (fixed & persentase).
- **Payment & Order Lifecycle:**
  - Integrasi Midtrans Snap dengan countdown transaksi tersinkronisasi.
  - Webhook listener (`/api/webhook/midtrans`) dengan verifikasi signature hash SHA512.
  - Adaptive smart polling (`/api/payment/[orderId]`) dengan Page Visibility API untuk fallback sinkronisasi status pembayaran otomatis.
  - Mekanisme rollback stok otomatis jika pesanan dibatalkan (`CANCELLED`/`EXPIRED`).
- **Admin Dashboard:**
  - Manajemen produk (rich text deskripsi via TipTap + Cloudinary upload).
  - Manajemen stok, kategori, dan pesanan pelanggan.
  - Sudo mode / Master security PIN untuk operasi sensitif.
- **Security:**
  - Rate limiting berbasis IP/User via Upstash Redis.
  - Sanitasi payload input (DOMPurify).
  - Proteksi rute via JWT middleware & custom auth guard.

---

## Struktur Folder

```text
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # API endpoints (auth, checkout, payment, webhook, admin)
│   ├── payment/          # Halaman status pembayaran & snap handler
│   └── (auth)/           # Rute autentikasi user & admin
├── components/           # UI Components (Navbar, Cart, ProductCard, Modals)
├── lib/                  # Utility functions (prisma, midtrans, redis, auth, sanitizers)
├── store/                # Zustand stores (useCartStore, etc.)
├── prisma/               # Schema database & migrasi
├── tests/                # Unit, Integration, & Functional tests (Vitest)
├── e2e/                  # End-to-end browser automation tests (Playwright)
└── analysis/             # Dokumen teknis, test review, & panduan manual testing
```

---

## Cara Menjalankan Project (Local Development)

### 1. Prasyarat
- Node.js versi 20+
- PostgreSQL database (lokal atau cloud provider seperti Supabase/Neon)
- Akun Midtrans Sandbox (Client Key & Server Key)
- Akun Cloudinary & Upstash Redis

### 2. Instalasi Dependency
```bash
npm install
```

### 3. Setup Environment Variables
Salin file `.env.example` menjadi `.env`, lalu lengkapi isinya:
```bash
cp .env.example .env
```

### 4. Setup Database
Sinkronkan schema Prisma ke database Anda:
```bash
npx prisma db push
npx prisma generate
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Menjalankan Testing

Project ini dilengkapi dengan total 37 test suite (322 automated tests) yang mencakup unit test, integration API, functional user journey, dan end-to-end browser testing.

### Menjalankan Unit, Integration, & Functional Tests (Vitest)
```bash
# Menjalankan seluruh test sekali jalan (CI mode)
npm run test:run

# Mode watch (interactive)
npm run test
```

### Menjalankan End-to-End Tests (Playwright)
```bash
# Pastikan server dev berjalan di localhost:3000
npm run test:e2e

# Menjalankan dengan UI mode
npx playwright test --ui
```

---

## Pengujian Midtrans Webhook di Local

Untuk menguji webhook Midtrans secara real-time di environment lokal:

1. Jalankan tunneling (misal menggunakan Cloudflare Tunnel atau Ngrok):
   ```bash
   .\cloudflared.exe tunnel --url http://localhost:3000
   ```
2. Masukkan URL tunnel ke **Midtrans Dashboard > Settings > Configuration > Payment Notification URL**:
   ```text
   https://<your-tunnel-url>/api/webhook/midtrans
   ```
3. Simulasi pembayaran melalui [Midtrans Payment Simulator](https://simulator.sandbox.midtrans.com).

Panduan skenario pengujian manual detail tersedia di [`analysis/phase5-manual-guide.md`](analysis/phase5-manual-guide.md).

---

## Build Production

```bash
npm run build
npm run start
```
