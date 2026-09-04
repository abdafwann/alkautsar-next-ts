'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CaretRight,
  Trash,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Package,
  ArrowLeft,
  Plant,
  WarningCircle,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { useCartStore } from '@/store/useCartStore';
import {
  updateDbCartItem,
  removeFromDbCart,
  clearDbCart,
  validateCartStock,
  CartStockValidationResult
} from '@/app/actions/cart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QuantityStepper } from '@/components/cart/QuantityStepper';
import toast from 'react-hot-toast';

function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  /*
   * State 'mounted' menjamin tree hydration identik antara SSR dan data cart 
   * di localStorage pengguna yang baru dapat dibaca setelah browser runtime aktif
   */
  const [mounted, setMounted] = useState(false);
  const [stockValidation, setStockValidation] = useState<CartStockValidationResult | null>(null);
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [isNavigatingCheckout, setIsNavigatingCheckout] = useState(false);

  /*
   * Validasi stok real-time ke database dilakukan secara asinkron agar pengguna 
   * segera mendapat peringatan bila barang yang disimpan telah terjual oleh pengguna lain
   */
  const runStockValidation = useCallback(async (cartItems = items) => {
    if (cartItems.length === 0) {
      setStockValidation(null);
      return;
    }
    setIsValidatingStock(true);
    const res = await validateCartStock(cartItems.map(i => ({ id: i.id, quantity: i.quantity })));
    setStockValidation(res);
    setIsValidatingStock(false);
  }, [items]);

  useEffect(() => {
    setMounted(true);
    runStockValidation();
  }, [runStockValidation]);

  if (!mounted) return null;

  const stockMap = new Map(stockValidation?.items?.map(i => [i.id, i]) || []);

  const handleUpdateQuantity = (id: string, currentQty: number, change: number) => {
    const itemStock = stockMap.get(id);
    const maxAllowed = itemStock?.availableStock !== undefined ? itemStock.availableStock : 999;
    const newQty = currentQty + change;

    if (change > 0 && newQty > maxAllowed) {
      toast.error(`Stok tidak mencukupi. Sisa stok tersedia: ${maxAllowed}`);
      return;
    }

    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }

    updateQuantity(id, newQty);
    updateDbCartItem(id, newQty).catch(() => {});

    /*
     * Memicu validasi ulang segera untuk memperbarui indikator peringatan 
     * tanpa harus menunggu polling periodik berikutnya
     */
    const nextItems = items.map(i => i.id === id ? { ...i, quantity: newQty } : i);
    runStockValidation(nextItems);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    removeFromDbCart(id).catch(() => {});
    toast.success('Produk dihapus dari keranjang');
    const nextItems = items.filter(i => i.id !== id);
    runStockValidation(nextItems);
  };

  const handleClearCart = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan keranjang belanja?')) {
      clearCart();
      clearDbCart().catch(() => {});
      setStockValidation(null);
      toast.success('Keranjang berhasil dikosongkan');
    }
  };

  /*
   * Fitur auto-adjust menyederhanakan pemulihan keranjang belanja saat stok terbatas 
   * sehingga pengguna tidak terhalang melanjutkan checkout tanpa harus menghitung manual
   */
  const handleAutoAdjustStock = () => {
    if (!stockValidation || stockValidation.isValid) return;

    let adjustedCount = 0;
    stockValidation.items.forEach(v => {
      if (v.hasExceeded) {
        if (v.availableStock <= 0) {
          removeItem(v.id);
          removeFromDbCart(v.id).catch(() => {});
          adjustedCount++;
        } else {
          updateQuantity(v.id, v.availableStock);
          updateDbCartItem(v.id, v.availableStock).catch(() => {});
          adjustedCount++;
        }
      }
    });

    toast.success(`${adjustedCount} produk berhasil disesuaikan dengan stok tersedia.`);
    runStockValidation();
  };

  /*
   * Pengecekan stok ganda saat checkout diklik berfungsi sebagai gerbang transaksi 
   * untuk memastikan tidak ada order dengan status over-stock yang terkirim ke gateway pembayaran
   */
  const handleProceedToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigatingCheckout(true);

    const check = await validateCartStock(items.map(i => ({ id: i.id, quantity: i.quantity })));
    setStockValidation(check);

    if (!check.isValid) {
      setIsNavigatingCheckout(false);
      toast.error(check.errorMessage || 'Stok beberapa produk tidak mencukupi. Harap sesuaikan jumlah barang.');
      return;
    }

    router.push('/checkout');
  };

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();

  const totalSavings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  const isCheckoutDisabled = items.length === 0 || (stockValidation !== null && !stockValidation.isValid);

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      {/*
       * Breadcrumb menjaga navigasi spasial pengguna agar mudah kembali ke katalog 
       * dengan pembatas border netral halus
       */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-green transition-colors">Beranda</Link>
          <CaretRight size={12} weight="bold" className="text-gray-400" />
          <span className="text-gray-900 font-semibold">Keranjang Belanja</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/*
         * Header section menampilkan jumlah total sediaan herbal 
         * untuk memberi transparansi instan terhadap isi belanjaan pelanggan
         */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-1">
              Daftar Belanja
            </span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
                Keranjang Belanja
              </h1>
              <span className="text-xs font-semibold text-gray-500">
                ({totalItems} sediaan herbal)
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
              aria-label="Kosongkan seluruh isi keranjang"
            >
              <Trash size={15} weight="duotone" />
              <span>Kosongkan Keranjang</span>
            </button>
          )}
        </div>

        {/*
         * Banner peringatan stok diletakkan paling atas saat validasi gagal 
         * agar pengguna segera menyadari kendala sebelum bergeser ke formulir pemesanan
         */}
        {stockValidation && !stockValidation.isValid && (
          <div className="mb-6 bg-amber-50/90 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <WarningCircle size={22} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-amber-900">
                  Perhatian: Ketersediaan Stok Terbatas
                </h4>
                <p className="text-xs text-amber-800/80 mt-0.5 leading-relaxed">
                  {stockValidation.errorMessage || 'Jumlah produk yang Anda pilih melebihi stok yang tersedia saat ini.'}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAutoAdjustStock}
              leftIcon={<ArrowsClockwise size={15} weight="bold" />}
              className="bg-amber-600 hover:bg-amber-700 text-white border-transparent shrink-0 text-xs font-bold rounded-lg shadow-2xs"
            >
              Sesuaikan Otomatis
            </Button>
          </div>
        )}

        {items.length === 0 ? (
          /*
           * Layout empty state mengarahkan pengguna kembali ke katalog produk 
           * dengan ajakan bertindak (CTA) utama yang menonjol
           */
          <div className="bg-white rounded-xl p-8 md:p-14 border border-gray-200 text-center max-w-lg mx-auto shadow-2xs">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <ShoppingBag size={28} weight="duotone" />
            </div>

            <h2 className="font-serif text-xl font-bold text-gray-900 mb-1.5">
              Keranjang Belanja Kosong
            </h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6 leading-relaxed">
              Anda belum menambahkan ramuan herbal fitofarmaka ke dalam keranjang belanja.
            </p>

            <Link href="/shop">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight size={14} weight="bold" />}
                className="font-bold text-xs rounded-lg shadow-2xs"
              >
                Jelajahi Produk Herbal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/*
             * Kolom kiri (8 kolom) menampung baris produk yang disusun simetris 
             * dengan garis pemisah halus berstandar Shape Consistency Lock (rounded-xl)
             */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100">
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const originalUnit = item.originalPrice || item.price;
                  const hasDiscount = originalUnit > item.price;
                  const stockInfo = stockMap.get(item.id);
                  const availableStock = stockInfo?.availableStock;
                  const isExceeded = stockInfo?.hasExceeded;
                  const isOutOfStock = availableStock !== undefined && availableStock <= 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isExceeded ? 'bg-amber-50/40' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          href={`/product/${item.slug}`}
                          className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center p-1.5 group"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              width={64}
                              height={64}
                              style={{ width: 'auto', height: 'auto' }}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Plant size={22} weight="duotone" className="text-gray-300" />
                          )}
                        </Link>

                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-semibold text-sm text-gray-900 hover:text-primary-green transition-colors line-clamp-1 leading-snug"
                          >
                            {item.title}
                          </Link>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-primary-green">
                              {formatRupiah(item.price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-gray-400 line-through text-[11px]">
                                {formatRupiah(originalUnit)}
                              </span>
                            )}
                            {item.discountPercentage ? (
                              <Badge variant="danger" size="sm">
                                -{item.discountPercentage}%
                              </Badge>
                            ) : null}
                          </div>

                          {/*
                           * Indikator peringatan stok level item memperjelas item spesifik 
                           * mana yang perlu diturunkan jumlahnya oleh pelanggan
                           */}
                          {isExceeded && (
                            <div className="pt-0.5">
                              {isOutOfStock ? (
                                <Badge variant="danger" size="sm">
                                  Stok Habis
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="sm">
                                  Stok tersisa {availableStock} item
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        
                        {/*
                         * Menggunakan QuantityStepper modular tersentralisasi 
                         * guna mencegah inkonsistensi aksi penambahan kuantitas
                         */}
                        <QuantityStepper
                          value={item.quantity}
                          max={availableStock !== undefined ? availableStock : 999}
                          isExceeded={isExceeded}
                          onDecrement={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          onIncrement={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          itemTitle={item.title}
                        />

                        <div className="text-right min-w-[96px]">
                          <p className="font-bold text-sm text-gray-900 font-mono">
                            {formatRupiah(itemTotal)}
                          </p>
                        </div>

                        {/*
                         * Tombol hapus item diberi aria-label spesifik nama produk 
                         * demi kemudahan navigasi perangkat bantu dengar / screen reader
                         */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-8 h-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                          title="Hapus produk"
                          aria-label={`Hapus ${item.title} dari keranjang`}
                        >
                          <Trash size={16} weight="duotone" />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-1">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 font-bold text-primary-green hover:text-primary-green-hover hover:underline"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Tambah Produk Herbal Lain</span>
                </Link>
                <span className="hidden sm:inline text-gray-400">Harga belum termasuk diskon voucher checkout</span>
              </div>
            </div>

            {/*
             * Kolom kanan (4 kolom) sticky panel ringkasan belanja menghitung subtotal 
             * dan mengunci tombol checkout jika terdapat peringatan stok yang belum disesuaikan
             */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs sticky top-24 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100 flex items-center justify-between">
                  <span>Ringkasan Belanja</span>
                  <span className="text-xs font-normal text-gray-400">{totalItems} Item</span>
                </h3>

                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Harga ({totalItems} barang)</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(subtotal)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Total Hemat Promo</span>
                      <span>-{formatRupiah(totalSavings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Estimasi Pengiriman</span>
                    <span className="font-bold text-primary-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 text-[10px]">
                      Gratis Area Jawa*
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Total Tagihan</span>
                    <span className="text-[10px] text-gray-400">Belum termasuk voucher</span>
                  </div>
                  <span className="text-lg font-black text-primary-green font-mono">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedToCheckout}
                  disabled={isCheckoutDisabled || isNavigatingCheckout}
                  isLoading={isNavigatingCheckout}
                  rightIcon={<ArrowRight size={14} weight="bold" />}
                  className="w-full h-11 text-xs font-bold rounded-lg shadow-2xs"
                >
                  Lanjut ke Checkout
                </Button>

                {stockValidation && !stockValidation.isValid && (
                  <p className="text-[11px] text-amber-700 font-medium text-center leading-relaxed bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                    Harap sesuaikan jumlah barang yang melebihi stok sebelum melanjutkan checkout.
                  </p>
                )}

                <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} weight="fill" className="text-primary-green shrink-0" />
                    <span>100% Produk Herbal Terstandar Resmi BPOM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={16} weight="duotone" className="text-primary-green shrink-0" />
                    <span>Pengemasan aman dengan bubble wrap berlapis</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
