'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  ArrowLeft
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { updateDbCartItem, removeFromDbCart, clearDbCart } from '@/app/actions/cart';
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleUpdateQuantity = (id: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    updateQuantity(id, newQty);
    updateDbCartItem(id, newQty).catch(() => {});
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    removeFromDbCart(id).catch(() => {});
    toast.success('Produk dihapus dari keranjang');
  };

  const handleClearCart = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan keranjang belanja?')) {
      clearCart();
      clearDbCart().catch(() => {});
      toast.success('Keranjang berhasil dikosongkan');
    }
  };

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();

  const totalSavings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-green transition-colors">Beranda</Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-900 font-medium">Keranjang Belanja</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Keranjang Belanja
            </h1>
            <span className="text-xs font-semibold text-gray-500">
              ({totalItems} barang)
            </span>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Kosongkan</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State: Crisp & Compact */
          <div className="bg-white rounded-xl p-8 md:p-12 border border-gray-200 text-center max-w-lg mx-auto shadow-2xs">
            <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <ShoppingBag size={24} strokeWidth={1.5} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1.5">
              Keranjang Belanja Kosong
            </h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6 leading-relaxed">
              Anda belum menambahkan produk herbal ke dalam keranjang.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green-hover text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-colors shadow-2xs active:scale-[0.99]"
            >
              <span>Mulai Belanja</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Active Cart: Structured Compact Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (8 cols): Clean Unified List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100">
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const originalUnit = item.originalPrice || item.price;
                  const hasDiscount = originalUnit > item.price;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <Link
                          href={`/product/${item.slug}`}
                          className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center p-1.5 group"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-lg">🌿</span>
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
                              <span className="bg-red-50 text-red-600 font-semibold px-1.5 py-0.2 rounded text-[10px]">
                                -{item.discountPercentage}%
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper, Subtotal & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        
                        {/* Compact Stepper */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/70 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="w-6 h-6 rounded bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer border border-gray-200"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center font-medium text-xs text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="w-6 h-6 rounded bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer border border-gray-200"
                            aria-label="Tambah jumlah"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[90px]">
                          <p className="font-bold text-sm text-gray-900">
                            {formatRupiah(itemTotal)}
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-7 h-7 text-gray-300 hover:text-red-500 rounded flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus produk"
                          aria-label={`Hapus ${item.title}`}
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 font-medium text-primary-green hover:underline"
                >
                  <ArrowLeft size={13} />
                  <span>Tambah Produk Lain</span>
                </Link>
                <span className="hidden sm:inline text-gray-400">Harga belum termasuk diskon voucher checkout</span>
              </div>
            </div>

            {/* Right Column (4 cols): Compact Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs sticky top-24 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-2.5 text-xs text-gray-600">
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

                  <div className="flex justify-between">
                    <span>Estimasi Ongkir</span>
                    <span className="font-semibold text-primary-green bg-green-50 px-1.5 py-0.5 rounded text-[11px] border border-green-100">
                      Gratis Area Jawa*
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block">Total Tagihan</span>
                    <span className="text-[10px] text-gray-400">Belum termasuk voucher</span>
                  </div>
                  <span className="text-lg font-extrabold text-primary-green">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full h-10 bg-primary-green hover:bg-primary-green-hover text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs active:scale-[0.99] cursor-pointer"
                >
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight size={14} />
                </Link>

                <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-primary-green shrink-0" />
                    <span>100% Produk Herbal Terstandar Resmi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PackageCheck size={14} className="text-primary-green shrink-0" />
                    <span>Pengemasan aman dengan bubble wrap</span>
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
