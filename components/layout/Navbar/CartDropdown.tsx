'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { removeFromDbCart } from '@/app/actions/cart';

interface CartDropdownProps {
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

export function CartDropdown({
  isOpen,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  onClose,
  isSyncing,
}: CartDropdownProps) {
  const cartItems = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const displayedItems = cartItems.slice(0, 4);

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(id);
    await removeFromDbCart(id);
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
            ? 'text-[var(--color-primary-green)] bg-[var(--color-secondary-green)]'
            : 'text-gray-700 hover:text-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green)]'
        }`}
        title="Keranjang Belanja"
        aria-label="Keranjang Belanja"
      >
        <ShoppingCart size={19} />
        {!isSyncing && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--color-primary-green)] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>

      {/* Dropdown Panel with Soft Floating Elevation */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.1)] py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-xs">
              Keranjang Belanja ({totalItems})
            </h3>
            <Link
              href="/cart"
              onClick={onClose}
              className="text-[11px] font-bold text-[var(--color-primary-green)] hover:underline flex items-center gap-0.5"
            >
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>

          {/* Cart Items List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center px-4">
                <ShoppingBag size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">Keranjang masih kosong</p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="mt-2.5 inline-block text-xs font-bold text-[var(--color-primary-green)] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Mulai Belanja Herbal
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
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} onClick={onClose}>
                      <p className="text-xs font-bold text-gray-900 truncate hover:text-[var(--color-primary-green)]">
                        {item.title}
                      </p>
                    </Link>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <span>{item.quantity} ×</span>
                      <span className="font-bold text-[var(--color-primary-green)]">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cartItems.length > 0 && (
            <div className="px-4 pt-3 border-t border-gray-100 mt-1 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Total Harga:</span>
                <span className="font-extrabold text-sm text-[var(--color-primary-green)]">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full text-center py-2 bg-[var(--color-primary-green)] hover:bg-[var(--color-primary-green-hover)] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Lanjut ke Keranjang
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
