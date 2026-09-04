'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash, ArrowRight } from '@phosphor-icons/react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toggleDbWishlist } from '@/app/actions/wishlist';

interface WishlistDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
  isSyncing: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function WishlistDropdown({
  isOpen,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  onClose,
  isSyncing,
}: WishlistDropdownProps) {
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleItem = useWishlistStore((s) => s.toggleItem);

  const displayedItems = wishlistItems.slice(0, 4);

  const handleRemove = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(item);
    await toggleDbWishlist(item.id);
  };

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-9 h-9 rounded-lg transition-colors cursor-pointer flex items-center justify-center relative ${
          isOpen
            ? 'text-red-500 bg-red-50'
            : 'text-gray-700 hover:text-red-500 hover:bg-red-50'
        }`}
        title="Wishlist Favorit"
        aria-label="Wishlist Favorit"
      >
        <Heart size={19} weight={wishlistItems.length > 0 ? 'fill' : 'duotone'} className={wishlistItems.length > 0 ? 'text-red-500' : ''} />
        {!isSyncing && wishlistItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
            {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel with Soft Floating Elevation */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.1)] py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-xs">
              Wishlist Saya ({wishlistItems.length})
            </h3>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="text-[11px] font-bold text-[var(--color-primary-green)] hover:underline flex items-center gap-0.5"
            >
              Lihat Semua <ArrowRight size={12} weight="bold" />
            </Link>
          </div>

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {wishlistItems.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Heart size={32} weight="duotone" className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Belum ada produk favorit</p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="mt-2.5 inline-block text-xs font-bold text-[var(--color-primary-green)] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Jelajahi Produk
                </Link>
              </div>
            ) : (
              displayedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50/80 transition-colors">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={40}
                      height={40}
                      style={{ width: 'auto', height: 'auto' }}
                      className="max-h-full max-w-full object-contain p-0.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} onClick={onClose}>
                      <p className="text-xs font-bold text-gray-900 truncate hover:text-[var(--color-primary-green)]">
                        {item.title}
                      </p>
                    </Link>
                    <div className="text-[11px] font-bold text-[var(--color-primary-green)] mt-0.5">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemove(item, e)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash size={14} weight="duotone" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="px-4 pt-2.5 border-t border-gray-100 mt-1">
              <Link
                href="/wishlist"
                onClick={onClose}
                className="block w-full text-center py-2 bg-[#f8fafc] hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Buka Halaman Wishlist
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
