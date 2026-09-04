'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from '@phosphor-icons/react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import toast from 'react-hot-toast';
import { addToDbCart } from '@/app/actions/cart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  imageUrl: string;
  slug?: string;
  productForm?: string | null;
  quantity?: number;
}

export default function ProductCard({
  id,
  title,
  price,
  originalPrice,
  discountPercentage,
  imageUrl,
  slug = 'dolor',
  productForm,
  quantity,
}: ProductCardProps) {
  /*
   * State 'mounted' mencegah terjadinya hydration mismatch antara render awal SSR 
   * dan status localStorage/Zustand persist yang hanya tersedia di browser
   */
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  /*
   * Fallback slug-title menjamin kestabilan identitas produk jika ID relasional 
   * belum ter-populate dari payload query ringan
   */
  const productId = id || slug + '-' + title;
  const wishlisted = mounted ? isInWishlist(productId) : false;
  const hasDiscount = Boolean(originalPrice && originalPrice > price);
  const isOutOfStock = quantity !== undefined && quantity <= 0;
  const isLowStock = quantity !== undefined && quantity > 0 && quantity <= 5;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(originalPrice)
    : null;

  /*
   * Validasi stok dan penambahan item ke keranjang belanja
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('Maaf, stok produk ini sedang habis.');
      return;
    }

    const currentInCart = cartItems.find((i) => i.id === productId)?.quantity || 0;
    if (quantity !== undefined && currentInCart >= quantity) {
      toast.error(`Stok maksimal (${quantity} item) sudah ada di keranjang belanja Anda.`);
      return;
    }

    addItem({
      id: productId,
      title,
      price,
      originalPrice,
      discountPercentage,
      imageUrl,
      slug,
    });
    addToDbCart(productId, 1).catch(console.error);
    toast.success(`${title} ditambahkan ke keranjang`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: productId,
      title,
      price,
      originalPrice,
      discountPercentage,
      imageUrl,
      slug,
    });
    toast.success(
      wishlisted ? `${title} dihapus dari wishlist` : `${title} ditambahkan ke wishlist`
    );
  };

  return (
    <div
      className="group h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/*
       * Kontainer kartu utama: Link hanya membungkus area visual & teks, 
       * tombol aksi wishlist dan + Keranjang berada di luar Link untuk mencegah nested interactive navigation
       */}
      <div className="relative h-[320px] bg-white rounded-xl border border-gray-200/90 shadow-2xs transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] group-hover:border-gray-300 group-hover:z-10 group-hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
        
        {/* Link Navigasi ke Detail Produk */}
        <Link href={`/product/${slug}`} className="block flex-1 flex flex-col">
          <div className="relative h-[180px] bg-gray-50/80 overflow-hidden shrink-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain p-3 transition-transform duration-500 ease-out ${
                isHovered && !isOutOfStock ? 'scale-110' : 'scale-100'
              } ${isOutOfStock ? 'opacity-55 grayscale-[25%]' : ''}`}
            />

            {/* Badges (Stok Habis / Stok Tipis / Diskon) */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
              {isOutOfStock && (
                <Badge variant="danger" size="sm">
                  Stok Habis
                </Badge>
              )}
              {!isOutOfStock && isLowStock && (
                <Badge variant="warning" size="sm">
                  Sisa {quantity}
                </Badge>
              )}
              {!isOutOfStock && hasDiscount && discountPercentage && (
                <Badge variant="sale" size="sm">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>
          </div>

          <div className="p-3.5 pb-2 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary-green transition-colors">
                {title}
              </h3>

              {productForm && productForm !== '-' && (
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">
                  {productForm}
                </p>
              )}
            </div>

            <div className="flex flex-col mt-auto pt-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`text-sm sm:text-base font-bold font-mono ${isOutOfStock ? 'text-gray-400' : 'text-primary-green'}`}>
                  {formattedPrice}
                </span>
                {hasDiscount && formattedOriginalPrice && (
                  <span className="text-xs text-gray-400 line-through font-mono">
                    {formattedOriginalPrice}
                  </span>
                )}
              </div>

              {/* Status Stok Teks */}
              {isOutOfStock ? (
                <span className="text-[10px] font-bold text-red-600 mt-0.5">
                  Stok Habis
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-bold text-amber-600 mt-0.5">
                  Sisa {quantity} item lagi!
                </span>
              ) : null}
            </div>
          </div>
        </Link>

        {/* Tombol Wishlist (Berada di luar Link) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-xs border shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
            wishlisted
              ? 'text-rose-600 bg-rose-50 border-rose-200'
              : 'text-gray-400 border-gray-200/80 hover:text-rose-600 hover:border-gray-300'
          }`}
          aria-label={
            wishlisted
              ? `Hapus ${title} dari wishlist`
              : `Tambah ${title} ke wishlist`
          }
        >
          <Heart
            size={17}
            weight={wishlisted ? 'fill' : 'regular'}
          />
        </button>

        {/*
         * Bilah aksi tombol '+ Keranjang' meluncur naik (slide-up) hanya saat kartu di-hover, 
         * Berada di luar Link sehingga klik tombol tidak pernah memicu rute halaman
         */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-white border-t border-gray-100 px-3.5 py-2.5 transition-all duration-300 ease-out ${
            isHovered
              ? 'translate-y-0 opacity-100 pointer-events-auto'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          {isOutOfStock ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="w-full h-8 text-xs font-semibold rounded-lg bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed flex items-center justify-center"
            >
              Stok Habis
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              className="w-full h-8 text-xs font-semibold rounded-lg shadow-2xs flex items-center justify-center active:scale-[0.98] cursor-pointer"
            >
              {isLowStock ? `+ Keranjang (Sisa ${quantity})` : '+ Keranjang'}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
