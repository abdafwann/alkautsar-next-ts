'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import toast from 'react-hot-toast';

interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
  slug?: string;
  _count?: { products: number };
}

interface HealthFocusExplorerProps {
  categories?: CategoryItem[];
  products: any[];
}

function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function HealthFocusExplorer({ categories = [], products = [] }: HealthFocusExplorerProps) {
  const [selectedId, setSelectedId] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const now = new Date();

  // Combine "All" with real database categories
  const tabList = [
    {
      id: 'all',
      num: '01',
      name: 'Semua Produk',
      description: 'Seluruh koleksi sediaan herbal fitofarmaka Al-Kautsar berizin edar resmi BPOM RI.',
      count: products.length,
    },
    ...categories.map((cat, idx) => ({
      id: cat.id,
      num: String(idx + 2).padStart(2, '0'),
      name: cat.name,
      description: cat.description || `Formulasi herbal terstandar untuk kategori ${cat.name}.`,
      count: cat._count?.products ?? products.filter((p) => p.categoryId === cat.id || p.category?.id === cat.id || p.category?.name === cat.name).length,
    })),
  ];

  const activeTab = tabList.find((t) => t.id === selectedId) || tabList[0];

  // Check scroll possibilities
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = direction === 'left' ? -240 : 240;
    scrollRef.current.scrollBy({ left: distance, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const handleSelectTab = (tabId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedId(tabId);
    // Smoothly center the clicked tab in the viewport
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  // Filter products based on selected category ID
  const filteredProducts = selectedId === 'all'
    ? products.slice(0, 4)
    : products.filter((p) => p.categoryId === selectedId || p.category?.id === selectedId || p.category?.name?.toLowerCase() === activeTab.name.toLowerCase());

  const displayProducts = filteredProducts.length > 0 ? filteredProducts.slice(0, 4) : products.slice(0, 4);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const imgUrl = product.images?.[0]?.url || '';
    const isPromoValid = product.promoPrice && product.promoPrice > 0 && (!product.promoExpiry || new Date(product.promoExpiry) >= now);
    const finalPrice = isPromoValid ? product.promoPrice : product.price;
    const productName = product.title || product.name;

    addItem({
      id: product.id,
      title: productName,
      price: finalPrice,
      imageUrl: imgUrl,
      slug: product.slug,
    });

    toast.success(`${productName} masuk ke keranjang`);
  };

  const handleToggleWishlist = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const imgUrl = product.images?.[0]?.url || '';
    const wishlisted = isInWishlist(product.id);
    const productName = product.title || product.name;

    toggleWishlist({
      id: product.id,
      title: productName,
      price: product.price,
      imageUrl: imgUrl,
      slug: product.slug,
    });

    toast.success(wishlisted ? `${productName} dihapus dari wishlist` : `${productName} disimpan ke wishlist`);
  };

  return (
    <section className="py-14 md:py-20 bg-white border-b border-[#ede8de]/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 pb-4 border-b border-[#e5dfd3]">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-1">
              Kategori & Solusi
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
              Pilihan Herbal Berdasarkan Kategori
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-text-main hover:text-primary-green transition-colors group shrink-0"
          >
            <span>Semua Produk ({products.length})</span>
            <ArrowUpRight size={14} className="text-text-main/60 group-hover:text-primary-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>

        {/* Real DB Category Track with Inline Slider Navigation */}
        <div className="relative flex items-center mb-3 group/slider">
          {/* Left Inline Arrow */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-2 z-10 flex items-center pr-4 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="w-7 h-7 rounded-full bg-white border border-[#e8e2d8] shadow-md flex items-center justify-center text-text-main hover:text-primary-green hover:bg-secondary-cream transition-all cursor-pointer pointer-events-auto active:scale-90"
                title="Geser ke Kiri"
                aria-label="Geser ke Kiri"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          )}

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth w-full px-0.5"
          >
            {tabList.map((tab) => {
              const isSelected = tab.id === selectedId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => handleSelectTab(tab.id, e)}
                  className={`group px-3.5 py-1.5 rounded-xl text-xs transition-colors duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 select-none border ${
                    isSelected
                      ? 'bg-text-main text-white border-text-main shadow-2xs'
                      : 'bg-[#faf9f6] text-text-main/75 hover:text-text-main hover:bg-[#f3ede3] border-[#e8e2d8]'
                  }`}
                >
                  <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-primary-green' : 'text-accent-brown/70 group-hover:text-accent-brown'}`}>
                    {tab.num}
                  </span>
                  <span className="font-bold whitespace-nowrap">
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Inline Arrow */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-2 z-10 flex items-center pl-4 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="w-7 h-7 rounded-full bg-white border border-[#e8e2d8] shadow-md flex items-center justify-center text-text-main hover:text-primary-green hover:bg-secondary-cream transition-all cursor-pointer pointer-events-auto active:scale-90"
                title="Geser ke Kanan"
                aria-label="Geser ke Kanan"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Compact Real Category Subtext */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-text-main/65">
          <p className="line-clamp-1">
            <strong className="text-text-main font-semibold mr-1.5">{activeTab.name}:</strong>
            <span>{activeTab.description}</span>
          </p>

          <Link
            href={selectedId === 'all' ? '/shop' : `/shop?category=${selectedId}`}
            className="inline-flex items-center gap-1 font-bold text-primary-green hover:text-primary-green-hover transition-colors shrink-0 text-[11px]"
          >
            <span>Katalog Lengkap ({activeTab.count} Produk) ↗</span>
          </Link>
        </div>

        {/* 4-Card Focused Product Shelf */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayProducts.map((product) => {
            const imgUrl = product.images?.[0]?.url;
            const isPromoValid = product.promoPrice && product.promoPrice > 0 && (!product.promoExpiry || new Date(product.promoExpiry) >= now);
            const displayPrice = isPromoValid ? product.promoPrice : product.price;
            const discountPercent = isPromoValid ? Math.round(((product.price - product.promoPrice) / product.price) * 100) : 0;
            const isWishlisted = isInWishlist(product.id);
            const productName = product.title || product.name;

            return (
              <div
                key={product.id}
                className="group relative bg-[#faf9f6] rounded-2xl p-3 border border-[#eee9df] hover:border-primary-green/30 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative w-full h-36 sm:h-40 md:h-44 rounded-xl bg-white overflow-hidden flex items-center justify-center p-2.5 mb-2.5 border border-[#f0ece3]">
                    
                    <Link href={`/product/${product.slug}`} className="block w-full h-full flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={productName}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-xl">🌿</span>
                          <p className="text-[11px] font-bold text-text-main mt-0.5">{productName}</p>
                        </div>
                      )}
                    </Link>

                    {/* Promo Tag */}
                    {isPromoValid && discountPercent > 0 && (
                      <div className="absolute top-2 left-2 pointer-events-none">
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                          Hemat {discountPercent}%
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className={`absolute top-2 right-2 w-6.5 h-6.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-white/90 hover:bg-white text-gray-400 hover:text-rose-500 border border-gray-100 shadow-2xs'
                      }`}
                      title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={13}
                        className={isWishlisted ? 'fill-rose-500' : ''}
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5 px-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-brown block">
                      {product.category?.name || 'Herbal Alami'}
                    </span>

                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="font-bold text-sm text-text-main group-hover:text-primary-green transition-colors line-clamp-1 leading-snug">
                        {productName}
                      </h3>
                    </Link>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="pt-2.5 mt-2 border-t border-[#eee9df] flex items-center justify-between gap-2">
                  <div>
                    {isPromoValid && (
                      <p className="text-[10px] text-gray-400 line-through leading-tight">
                        {formatRupiah(product.price)}
                      </p>
                    )}
                    <p className="text-sm sm:text-base font-extrabold text-primary-green leading-tight">
                      {formatRupiah(displayPrice)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(product, e)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-green hover:bg-primary-green-hover active:scale-95 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    title="Tambah ke Keranjang"
                  >
                    <Plus size={13} />
                    <span>Beli</span>
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
