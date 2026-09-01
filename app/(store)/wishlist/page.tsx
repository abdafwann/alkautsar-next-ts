'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Store,
  Leaf,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useWishlistStore, WishlistItem } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addToCart = useCartStore((s) => s.addItem);

  const [mounted, setMounted] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fafcfb] pt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Financial calculations
  const totalValue = items.reduce((acc, item) => acc + item.price, 0);
  const totalOriginal = items.reduce((acc, item) => acc + (item.originalPrice || item.price), 0);
  const totalSavings = totalOriginal - totalValue;

  const handleMoveToCart = (item: WishlistItem) => {
    setMovingId(item.id);
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      discountPercentage: item.discountPercentage,
      imageUrl: item.imageUrl,
      slug: item.slug,
    });
    removeItem(item.id);
    toast.success(`${item.title} dipindahkan ke keranjang!`);
    setMovingId(null);
  };

  const handleMoveAllToCart = () => {
    if (items.length === 0) return;
    
    items.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice,
        discountPercentage: item.discountPercentage,
        imageUrl: item.imageUrl,
        slug: item.slug,
      });
    });
    
    const count = items.length;
    clearWishlist();
    toast.success(`${count} produk berhasil dipindahkan ke keranjang belanja!`);
  };

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-24">
      
      {/* 1. Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3.5 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Link href="/" className="hover:text-[#00AA5B] transition-colors">
            Beranda
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900 font-semibold">Wishlist</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        
        {/* 2. Top Title Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Wishlist Saya
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#00AA5B]">
                {items.length} Produk
              </span>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Daftar produk herbal pilihan yang disimpan untuk dibeli.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 bg-white text-gray-600 hover:text-red-600 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Hapus semua produk dari wishlist"
            >
              <Trash2 size={13} />
              <span>Kosongkan Semua</span>
            </button>
          )}
        </div>

        {/* 3. Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 sm:p-20 text-center max-w-lg mx-auto shadow-2xs my-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#00AA5B] flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
              <Heart size={26} strokeWidth={1.8} className="fill-emerald-100" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1.5">
              Wishlist Anda Masih Kosong
            </h2>
            <p className="text-gray-500 text-xs max-w-xs mx-auto mb-8 leading-relaxed">
              Simpan produk herbal favorit Anda saat menjelajah toko agar mudah ditemukan kembali kapan saja.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00AA5B] hover:bg-[#00914d] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <Store size={15} />
              <span>Jelajahi Katalog Produk</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* 4. Active Wishlist (Vertical List + Sticky Summary Sidebar) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Area: Vertical List of Wishlist Products */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden">
                {items.map((item) => {
                  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                  const isMoving = movingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Product Media & Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Image */}
                        <Link 
                          href={`/product/${item.slug}`} 
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-gray-50/80 p-2 shrink-0 border border-gray-100/90 relative overflow-hidden flex items-center justify-center group-hover:border-[#00AA5B]/30 transition-colors"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              sizes="96px"
                              className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <Leaf size={24} className="text-gray-300" />
                          )}
                        </Link>

                        {/* Title & Pricing */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <Link href={`/product/${item.slug}`}>
                            <h2 className="text-sm font-bold text-gray-900 hover:text-[#00AA5B] transition-colors line-clamp-1 leading-snug">
                              {item.title}
                            </h2>
                          </Link>

                          {/* Price Display */}
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-sm sm:text-base font-extrabold text-[#00AA5B]">
                              {formatRupiah(item.price)}
                            </span>
                            {hasDiscount && item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatRupiah(item.originalPrice)}
                              </span>
                            )}
                            {hasDiscount && item.discountPercentage && (
                              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold">
                                -{item.discountPercentage}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium pt-0.5">
                            <ShieldCheck size={12} className="text-[#00AA5B]" />
                            <span>100% Produk Herbal Terdaftar BPOM</span>
                          </div>
                        </div>
                      </div>

                      {/* Item Action Cluster (Icon-only buttons) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={isMoving}
                          className="w-9 h-9 rounded-xl bg-[#00AA5B] hover:bg-[#00914d] active:scale-95 text-white flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
                          aria-label={`Pindahkan ${item.title} ke keranjang`}
                          title="Pindahkan ke keranjang"
                        >
                          <ShoppingBag size={15} />
                        </button>

                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast.success(`${item.title} dihapus dari wishlist.`);
                          }}
                          className="w-9 h-9 rounded-xl border border-gray-200 hover:border-red-200 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          aria-label={`Hapus ${item.title}`}
                          title="Hapus dari wishlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Area: Sticky Summary Sidebar */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Total Produk</span>
                    <span className="font-semibold text-gray-900">{items.length} Barang</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500">
                    <span>Total Nilai Produk</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(totalOriginal)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-[#00AA5B] font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> Total Penghematan
                      </span>
                      <span>- {formatRupiah(totalSavings)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Total Pembelian</span>
                    <span className="text-base font-extrabold text-[#00AA5B]">
                      {formatRupiah(totalValue)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleMoveAllToCart}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00AA5B] hover:bg-[#00914d] active:scale-98 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>Pindahkan Semua ke Keranjang</span>
                </button>
              </div>

              {/* Secure Trust Note */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-100/60 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-800 font-medium">
                <Leaf size={14} className="text-[#00AA5B] shrink-0" />
                <span>Seluruh produk 100% original berstandar resmi BPOM & Halal.</span>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
