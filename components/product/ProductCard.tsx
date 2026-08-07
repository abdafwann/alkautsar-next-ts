'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/components/ui/ToastContainer';
import { addToDbCart } from '@/app/actions/cart';

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
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const addToast = useToastStore((s) => s.addToast);

  const productId = id || slug + '-' + title;
  const wishlisted = isInWishlist(productId);

  // Format to Rupiah
  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  const formattedOriginalPrice = originalPrice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(originalPrice) : null;

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
    
    // Background sync to DB (optimistic UI)
    addToDbCart(productId, 1).catch(console.error);

    addToast(`${title} ditambahkan ke keranjang`);
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
    addToast(wishlisted ? `${title} dihapus dari wishlist` : `${title} ditambahkan ke wishlist`);
  };

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col group">
      <Link href={`/product/${slug}`} className="block relative bg-gray-50 rounded-xl mb-3 p-4 flex items-center justify-center aspect-[4/3] overflow-hidden">
        {discountPercentage && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
            PROMO
          </div>
        )}
        <img
          alt={title}
          className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          src={imageUrl}
        />
      </Link>
      <div className="flex flex-col mb-2 min-h-[48px]">
        <Link href={`/product/${slug}`} className="w-full">
          <h3 className="font-bold text-gray-900 text-sm leading-tight hover:text-primary-green transition-colors line-clamp-2">{title}</h3>
        </Link>
        {productForm && productForm !== '-' && (
          <p className="text-[11px] text-gray-500 mt-1 font-medium">{productForm}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-1 h-4">
        {formattedOriginalPrice ? (
          <p className="text-xs text-gray-400 line-through">
            {formattedOriginalPrice}
          </p>
        ) : (
          <div className="text-xs h-4"></div>
        )}
        {discountPercentage && (
          <span className="bg-green-100 text-primary-green text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
            Hemat {discountPercentage}%
          </span>
        )}
      </div>
      
      <div className="text-lg font-bold text-primary-green mb-4">{formattedPrice}</div>

      <div className="flex items-center gap-2 mt-auto">
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-primary-green text-white font-semibold rounded-lg transition-colors hover:bg-primary-green-hover text-[11px] py-2"
        >
          Add to cart
        </button>
        <button 
          onClick={handleToggleWishlist}
          className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border transition-colors ${
            wishlisted 
              ? 'border-accent-gold text-accent-gold bg-amber-50' 
              : 'border-gray-300 text-gray-500 hover:text-accent-gold'
          }`}
        >
          <Heart size={16} strokeWidth={1.5} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
