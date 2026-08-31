'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import toast from 'react-hot-toast';

interface ProductCarouselV2Props {
  products: any[];
  title?: string;
}

function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCarouselV2({ products, title = 'Produk Terlaris' }: ProductCarouselV2Props) {
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const now = new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <section className="py-20 md:py-28 bg-[#faf9f6] border-b border-[#ede8de]/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-2">
              Katalog Unggulan
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight">
              {title}
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-green hover:text-primary-green-hover transition-colors shrink-0"
          >
            <span>Buka Semua Produk ({products.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 5-Column Slim E-Commerce Grid (Option B) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {products.slice(0, 10).map((product) => {
            const imgUrl = product.images?.[0]?.url;
            const isPromoValid = product.promoPrice && product.promoPrice > 0 && (!product.promoExpiry || new Date(product.promoExpiry) >= now);
            const displayPrice = isPromoValid ? product.promoPrice : product.price;
            const discountPercent = isPromoValid ? Math.round(((product.price - product.promoPrice) / product.price) * 100) : 0;
            const isWishlisted = mounted ? isInWishlist(product.id) : false;
            const productName = product.title || product.name;
            const bpomCert = product.certificate || 'POM TR';

            return (
              <div
                key={product.id}
                className="group relative bg-[#faf9f6] rounded-2xl p-3 border border-[#eee9df] hover:border-primary-green/30 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container (Compact h-40 sm:h-44) */}
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

                    {/* Clean Promo Tag (Only shown if discounted) */}
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
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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

                  {/* Info (Compact & Crisp) */}
                  <div className="space-y-0.5 px-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-brown block">
                      {product.category?.name || 'Herbal Pilihan'}
                    </span>

                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="font-bold text-sm text-text-main group-hover:text-primary-green transition-colors line-clamp-1 leading-snug">
                        {productName}
                      </h3>
                    </Link>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="pt-3 mt-2.5 border-t border-[#eee9df] flex items-center justify-between gap-2">
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
