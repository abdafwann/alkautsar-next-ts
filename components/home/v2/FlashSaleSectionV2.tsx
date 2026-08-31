'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

interface FlashSaleSectionV2Props {
  products: any[];
}

function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Standard Production useCountdown Hook
 * Mengkalkulasi waktu sisa dari target waktu konstan (targetEpoch)
 * dan memicu re-render state tiap 1 detik secara presisi tanpa stale closure.
 */
function useCountdown(targetDateStr?: string | null) {
  const targetTime = useMemo(() => {
    if (targetDateStr && new Date(targetDateStr).getTime() > Date.now()) {
      return new Date(targetDateStr).getTime();
    }
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.getTime();
  }, [targetDateStr]);

  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => Math.max(0, targetTime - Date.now()));

  useEffect(() => {
    // 1. Eksekusi langsung saat mount
    setTimeLeftMs(Math.max(0, targetTime - Date.now()));

    // 2. Set interval update state setiap detik
    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        setTimeLeftMs(0);
        clearInterval(timer);
      } else {
        setTimeLeftMs(remaining);
      }
    }, 1000);

    // 3. Cleanup timer saat unmount
    return () => clearInterval(timer);
  }, [targetTime]);

  const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: timeLeftMs <= 0 };
}

function PromoCountdownTimer({ targetExpiryString }: { targetExpiryString?: string | null }) {
  const [mounted, setMounted] = useState(false);
  const { days, hours, minutes, seconds } = useCountdown(targetExpiryString);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 font-mono text-xs font-bold text-gray-900">
        <span className="bg-[#111827] text-white px-2 py-0.5 rounded-md">--</span>
        <span className="text-gray-400">:</span>
        <span className="bg-[#111827] text-white px-2 py-0.5 rounded-md">--</span>
        <span className="text-gray-400">:</span>
        <span className="bg-[#111827] text-white px-2 py-0.5 rounded-md">--</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold text-gray-900">
      {days > 0 && (
        <>
          <span className="bg-[#1f422e] text-white px-2 py-0.5 rounded-md">{days}h</span>
          <span className="text-gray-400">:</span>
        </>
      )}
      <span className="bg-[#111827] text-white px-2 py-0.5 rounded-md">{String(hours).padStart(2, '0')}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-[#111827] text-white px-2 py-0.5 rounded-md">{String(minutes).padStart(2, '0')}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-[#111827] text-white px-2 py-0.5 rounded-md">{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}

export default function FlashSaleSectionV2({ products }: FlashSaleSectionV2Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  if (!products || products.length === 0) return null;

  // Cari produk promo aktif dengan tanggal kedaluwarsa terdekat (misal: Daun Katuk)
  const now = Date.now();
  const activePromoProduct = products
    .filter((p) => p.promoExpiry && new Date(p.promoExpiry).getTime() > now)
    .sort((a, b) => new Date(a.promoExpiry).getTime() - new Date(b.promoExpiry).getTime())[0];

  const targetExpiryString = activePromoProduct?.promoExpiry || null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product: any) => {
    const title = product.title || product.name || 'Produk Herbal';
    const imgUrl = product.images?.[0]?.url || '';
    const finalPrice = product.promoPrice && product.promoPrice > 0 ? Number(product.promoPrice) : Number(product.price);

    addItem({
      id: product.id,
      title,
      price: finalPrice,
      imageUrl: imgUrl,
      slug: product.slug,
    });

    toast.success(`${title} masuk ke keranjang`);
  };

  return (
    <section className="py-16 md:py-24 bg-[#f4f8f4] border-b border-[#dfebdf]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Flash Sale Header & Live Countdown Timer */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#e2ddd0]">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8B5A2B] block mb-1.5">
              Penawaran Terbatas
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1a1a] tracking-tight">
              Promo Spesial Hari Ini
            </h2>
          </div>

          {/* Minimalist Countdown Clock and Navigation Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#e2ddd0] shadow-2xs">
              <Clock size={15} className="text-[#8B5A2B]" />
              <span className="text-xs text-gray-600 font-medium mr-1">Berakhir dalam:</span>
              <PromoCountdownTimer targetExpiryString={targetExpiryString} />
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={scrollLeft}
                className="w-9 h-9 rounded-full bg-white hover:bg-[#faf7f2] border border-[#e2ddd0] text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Geser ke Kiri"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={scrollRight}
                className="w-9 h-9 rounded-full bg-white hover:bg-[#faf7f2] border border-[#e2ddd0] text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Geser ke Kanan"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Product Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {products.map((product) => {
            const title = product.title || product.name || 'Produk Herbal';
            const imgUrl = product.images?.[0]?.url;
            const originalPrice = Number(product.price);
            const promoPrice = product.promoPrice ? Number(product.promoPrice) : originalPrice;
            const discount = product.promoPercentage 
              ? product.promoPercentage 
              : Math.round(((originalPrice - promoPrice) / originalPrice) * 100);

            return (
              <div
                key={product.id}
                className="min-w-[240px] sm:min-w-[260px] max-w-[260px] bg-white rounded-2xl p-4 border border-[#e5dfd2] hover:border-[#00AA5B]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 snap-start flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <Link
                    href={`/product/${product.slug}`}
                    className="block relative w-full h-44 bg-[#faf9f6] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3 border border-[#f0ece3]"
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-3">
                        <span className="text-2xl">🌿</span>
                        <p className="text-xs font-bold text-gray-900 mt-1">{title}</p>
                      </div>
                    )}

                    {/* Discount Tag */}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                        Hemat {discount}%
                      </span>
                    )}
                  </Link>

                  {/* Category & Title */}
                  <div className="space-y-1 px-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B] block">
                      {product.category?.name || 'Promo Herbal'}
                    </span>

                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#00AA5B] transition-colors line-clamp-1 leading-snug">
                        {title}
                      </h3>
                    </Link>
                  </div>
                </div>

                {/* Pricing & Add to Cart */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-[#00AA5B]">
                      {formatRupiah(promoPrice)}
                    </div>
                    {promoPrice < originalPrice && (
                      <div className="text-[11px] text-gray-400 line-through">
                        {formatRupiah(originalPrice)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-9 h-9 rounded-xl bg-[#e8f5e9] hover:bg-[#00AA5B] text-[#00AA5B] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
                    aria-label={`Beli ${title}`}
                    title="Tambah ke Keranjang"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
