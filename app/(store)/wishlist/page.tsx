'use client';

import Link from 'next/link';
import { ChevronRight, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/components/ui/ToastContainer';
import { useEffect, useState } from 'react';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addToCart = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const handleMoveToCart = (item: typeof items[0]) => {
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
    addToast(`${item.title} dipindahkan ke keranjang`);
  };

  const handleMoveAllToCart = () => {
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
    clearWishlist();
    addToast(`${items.length} produk dipindahkan ke keranjang`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-bold">Wishlist</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Wishlist Saya ({items.length} produk)</h1>
          
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleMoveAllToCart}
                className="bg-primary-green text-white font-bold rounded-xl px-6 py-2.5 hover:bg-primary-green-hover transition-colors text-sm flex items-center gap-2"
              >
                <ShoppingCart size={16} />
                Masukkan Semua ke Keranjang
              </button>
              <button 
                onClick={clearWishlist}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2.5"
              >
                <Trash2 size={14} />
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Heart size={64} className="text-gray-200 mb-6" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">Wishlist kamu masih kosong</h2>
            <p className="text-gray-400 text-sm mb-8">Simpan produk favoritmu agar mudah ditemukan nanti!</p>
            <Link 
              href="/shop" 
              className="bg-primary-green text-white font-bold rounded-xl px-8 py-3 hover:bg-primary-green-hover transition-colors"
            >
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => {
              const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price);
              const formattedOriginalPrice = item.originalPrice
                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.originalPrice)
                : null;

              return (
                <div key={item.id} className="flex items-center gap-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* Image */}
                  <Link href={`/product/${item.slug}`} className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-3">
                    <img src={item.imageUrl} alt={item.title} className="max-h-full object-contain" />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="font-bold text-gray-900 text-base hover:text-primary-green transition-colors mb-1">{item.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      {formattedOriginalPrice && (
                        <span className="text-sm text-gray-400 line-through">{formattedOriginalPrice}</span>
                      )}
                      {item.discountPercentage && (
                        <span className="bg-green-100 text-primary-green text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Hemat {item.discountPercentage}%
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary-green mt-1">{formattedPrice}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => handleMoveToCart(item)}
                      className="bg-primary-green text-white font-bold rounded-xl px-5 py-2.5 hover:bg-primary-green-hover transition-colors text-sm flex items-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      + Keranjang
                    </button>
                    <button 
                      onClick={() => {
                        removeItem(item.id);
                        addToast(`${item.title} dihapus dari wishlist`);
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
