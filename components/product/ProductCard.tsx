'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import toast from 'react-hot-toast';
import { addToDbCart } from '@/app/actions/cart';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  imageUrl: string;
  slug?: string;
  productForm?: string | null;
}

export default function ProductCard({
  id,
  title,
  price,
  originalPrice,
  discountPercentage,
  imageUrl,
  slug = "dolor",
  productForm
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);

  const productId = id || slug + '-' + title;
  const wishlisted = mounted ? isInWishlist(productId) : false;
  const hasDiscount = !!originalPrice && originalPrice > price;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price);

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(originalPrice)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    toast.success(wishlisted ? `${title} dihapus dari wishlist` : `${title} ditambahkan ke wishlist`);
  };

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${slug}`} className="block h-full">
        {/* Card Container - fixed height */}
        <div className="relative h-[320px] bg-white rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:shadow-[0_4px_24px_rgba(34,197,94,0.15),inset_0_0_0_1px_rgba(34,197,94,0.3)] group-hover:border-primary-green group-hover:z-10 group-hover:-translate-y-2">
          {/* Image Section */}
          <div className="relative h-[180px] bg-gray-50 overflow-hidden">
            {/* Product Image with zoom */}
            <img
              src={imageUrl}
              alt={title}
              className={`w-full h-full object-contain p-3 transition-transform duration-500 ease-out ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />

            {/* Discount Badge */}
            {hasDiscount && discountPercentage && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                {discountPercentage}% OFF
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 hover:scale-110 ${
                wishlisted
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-500'
              }`}
              aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
            >
              <Heart
                size={18}
                strokeWidth={1.75}
                fill={wishlisted ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Product Title */}
            <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
              {title}
            </h3>

            {/* Dosage Form */}
            {productForm && productForm !== '-' && (
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2 font-medium">
                {productForm}
              </p>
            )}

            {/* Price Section */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base font-bold text-primary-green">
                {formattedPrice}
              </span>
              {hasDiscount && formattedOriginalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Expandable Add to Cart Section */}
          <div
            className={`absolute inset-x-0 bottom-0 overflow-hidden transition-all duration-300 ease-out ${
              isHovered ? 'max-h-12' : 'max-h-0'
            }`}
          >
            <div className="bg-white border-t border-gray-100 px-4 py-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary-green text-white font-semibold py-1 rounded-lg hover:bg-primary-green-hover active:scale-[0.98] transition-all text-sm"
              >
                + Keranjang
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
