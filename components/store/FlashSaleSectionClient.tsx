'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Timer } from 'lucide-react';

interface FlashSaleSectionProps {
  products: any[];
}

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
    setTimeLeftMs(Math.max(0, targetTime - Date.now()));

    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        setTimeLeftMs(0);
        clearInterval(timer);
      } else {
        setTimeLeftMs(remaining);
      }
    }, 1000);

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
  const pad = (num: number) => num.toString().padStart(2, '0');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 font-mono text-lg font-bold">
        <div className="bg-white/20 px-2 py-0.5 rounded">--</div>
        <span>:</span>
        <div className="bg-white/20 px-2 py-0.5 rounded">--</div>
        <span>:</span>
        <div className="bg-white/20 px-2 py-0.5 rounded">--</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 font-mono text-lg font-bold">
      {days > 0 && (
        <>
          <div className="bg-white/20 px-2 py-0.5 rounded">{days}h</div>
          <span>:</span>
        </>
      )}
      <div className="bg-white/20 px-2 py-0.5 rounded">{pad(hours)}</div>
      <span>:</span>
      <div className="bg-white/20 px-2 py-0.5 rounded">{pad(minutes)}</div>
      <span>:</span>
      <div className="bg-white/20 px-2 py-0.5 rounded">{pad(seconds)}</div>
    </div>
  );
}

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const now = Date.now();
  const activePromoProduct = products
    .filter((p) => p.promoExpiry && new Date(p.promoExpiry).getTime() > now)
    .sort((a, b) => new Date(a.promoExpiry).getTime() - new Date(b.promoExpiry).getTime())[0];

  const targetExpiryString = activePromoProduct?.promoExpiry || null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 0;
      const gap = 16;
      scrollContainerRef.current.scrollBy({ left: -(cardWidth + gap) * 2, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 0;
      const gap = 16;
      scrollContainerRef.current.scrollBy({ left: (cardWidth + gap) * 2, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-100 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div className="flex items-center gap-4 md:gap-8 flex-wrap">
            <h2 className="text-3xl font-black text-red-600 italic tracking-tight flex items-center gap-2">
              <span className="text-4xl">⚡</span> FLASH SALE
            </h2>
            
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-md shadow-red-200">
              <Timer size={18} className="animate-pulse" />
              <span className="font-bold text-sm uppercase tracking-wider mr-2">Berakhir Dalam:</span>
              <PromoCountdownTimer targetExpiryString={targetExpiryString} />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end w-full sm:w-auto">
            <button 
              onClick={scrollLeft}
              className="bg-white text-red-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 hover:scale-105 transition-all shadow-sm border border-red-100"
              aria-label="Previous"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              onClick={scrollRight}
              className="bg-white text-red-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 hover:scale-105 transition-all shadow-sm border border-red-100"
              aria-label="Next"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="snap-start flex-none w-[55%] sm:w-[35%] md:w-[25%] lg:w-[20%]" 
            >
              <ProductCard
                id={product.id}
                title={product.title}
                price={product.promoPrice || product.price}
                originalPrice={product.promoPrice ? product.price : undefined}
                discountPercentage={product.promoPercentage}
                imageUrl={product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/400x400?text=No+Image'}
                slug={product.slug}
                productForm={product.productForm}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
