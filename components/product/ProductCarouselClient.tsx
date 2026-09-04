'use client';

import { useRef } from 'react';
import ProductCard from '@/components/product/ProductCard';

interface ProductCarouselProps {
  products: any[];
  title?: string;
}

export default function ProductCarousel({ products, title = "Best Sellers" }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 0;
      const gap = 16; // 1rem (gap-4)
      scrollContainerRef.current.scrollBy({ left: -(cardWidth + gap) * 2, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 0;
      const gap = 16; // 1rem (gap-4)
      scrollContainerRef.current.scrollBy({ left: (cardWidth + gap) * 2, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-bold text-center text-dark-green relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-accent-gold mb-0">
              {title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={scrollLeft}
              className="bg-accent-gold text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors shadow-sm"
              aria-label="Previous"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              onClick={scrollRight}
              className="bg-accent-gold text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors shadow-sm"
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
          {products.length > 0 ? (
            products.map((product) => (
              <div 
                key={product.id} 
                className="snap-start flex-none w-[75%] sm:w-[45%] md:w-[30%] lg:w-[calc(100%/6-(16px*5)/6)]" 
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
                  quantity={product.quantity}
                />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-12 text-gray-500">
              Belum ada produk.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
