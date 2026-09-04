'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CaretRight, 
  Heart, 
  Trash, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Storefront,
  Plant,
  ShieldCheck
} from '@phosphor-icons/react';
import { useWishlistStore, WishlistItem } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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

  /*
   * Skeleton loader berlatar netral #fcfbf9 menjaga kestabilan visual 
   * sebelum data lokal tersinkronisasi di peramban pengguna
   */
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] pt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
          <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Kalkulasi total dan diskon wishlist
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
    <div className="min-h-screen bg-[#fcfbf9] pb-24">
      
      {/* 1. Breadcrumb Semantik */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3.5 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Link href="/" className="hover:text-primary-green transition-colors">
            Beranda
          </Link>
          <CaretRight size={12} weight="bold" className="text-gray-400" />
          <span className="text-gray-900 font-semibold">Wishlist</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        
        {/* 2. Header Judul & Kontrol Kosongkan Wishlist */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Wishlist Saya
              </h1>
              <Badge variant="success" size="sm">
                {items.length} Produk
              </Badge>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Daftar produk herbal pilihan yang disimpan untuk dibeli kemudian hari.
            </p>
          </div>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearWishlist}
              leftIcon={<Trash size={14} weight="bold" />}
              className="text-xs font-semibold text-gray-600 hover:text-red-600 hover:border-red-200 border-gray-200"
              title="Hapus semua produk dari wishlist"
            >
              Kosongkan Semua
            </Button>
          )}
        </div>

        {/* 3. Empty State Edukatif */}
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 sm:p-16 text-center max-w-lg mx-auto shadow-2xs my-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-primary-green flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
              <Heart size={26} weight="duotone" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1.5">
              Wishlist Anda Masih Kosong
            </h2>
            <p className="text-gray-500 text-xs max-w-xs mx-auto mb-6 leading-relaxed">
              Simpan produk herbal favorit Anda saat menjelajah toko agar mudah ditemukan kembali kapan saja.
            </p>

            <Link href="/shop" className="inline-block">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Storefront size={16} weight="bold" />}
                rightIcon={<ArrowRight size={14} weight="bold" />}
              >
                Jelajahi Katalog Produk
              </Button>
            </Link>
          </div>
        ) : (
          /* 4. Daftar Wishlist Aktif (Daftar Vertikal + Sticky Summary) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Kolom Kiri: Baris Produk Wishlist */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
                {items.map((item) => {
                  const hasDiscount = Boolean(item.originalPrice && item.originalPrice > item.price);
                  const isMoving = movingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Media & Informasi Produk */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link 
                          href={`/product/${item.slug}`} 
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-gray-50/80 p-2 shrink-0 border border-gray-200 relative overflow-hidden flex items-center justify-center group-hover:border-primary-green/40 transition-colors"
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
                            <Plant size={24} weight="duotone" className="text-gray-300" />
                          )}
                        </Link>

                        {/* Judul & Penentuan Harga */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <Link href={`/product/${item.slug}`}>
                            <h2 className="text-sm font-bold text-gray-900 hover:text-primary-green transition-colors line-clamp-1 leading-snug">
                              {item.title}
                            </h2>
                          </Link>

                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-sm sm:text-base font-extrabold text-primary-green font-mono">
                              {formatRupiah(item.price)}
                            </span>
                            {hasDiscount && item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through font-mono">
                                {formatRupiah(item.originalPrice)}
                              </span>
                            )}
                            {hasDiscount && item.discountPercentage && (
                              <Badge variant="danger" size="sm">
                                -{item.discountPercentage}%
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium pt-0.5">
                            <ShieldCheck size={13} weight="bold" className="text-primary-green" />
                            <span>100% Produk Herbal Terdaftar BPOM</span>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Aksi Item */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMoveToCart(item)}
                          disabled={isMoving}
                          className="w-9 h-9 p-0 rounded-xl shadow-2xs"
                          aria-label={`Pindahkan ${item.title} ke keranjang`}
                          title="Pindahkan ke keranjang"
                          leftIcon={<ShoppingBag size={15} weight="bold" />}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            removeItem(item.id);
                            toast.success(`${item.title} dihapus dari wishlist.`);
                          }}
                          className="w-9 h-9 p-0 rounded-xl border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                          aria-label={`Hapus ${item.title}`}
                          title="Hapus dari wishlist"
                          leftIcon={<Trash size={14} weight="bold" />}
                        />
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom Kanan: Ringkasan Wishlist Sticky */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
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
                    <span className="font-semibold text-gray-900 font-mono">{formatRupiah(totalOriginal)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-primary-green font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag size={12} weight="bold" /> Total Penghematan
                      </span>
                      <span className="font-mono">- {formatRupiah(totalSavings)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Total Pembelian</span>
                    <span className="text-base font-extrabold text-primary-green font-mono">
                      {formatRupiah(totalValue)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleMoveAllToCart}
                  leftIcon={<ShoppingBag size={16} weight="bold" />}
                  className="w-full text-xs font-bold shadow-2xs"
                >
                  Pindahkan Semua ke Keranjang
                </Button>
              </div>

              {/* Catatan Jaminan Keaslian */}
              <div className="p-3.5 bg-[#faf7f2] border border-[#ede7de] rounded-xl flex items-center gap-2.5 text-[11px] text-gray-700 font-medium">
                <Plant size={15} weight="duotone" className="text-primary-green shrink-0" />
                <span>Seluruh produk 100% original berstandar resmi BPOM & Halal Indonesia.</span>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
