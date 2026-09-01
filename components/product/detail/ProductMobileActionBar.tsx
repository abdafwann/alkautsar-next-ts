import { MessageCircle, Heart, Plus, ShoppingBag } from 'lucide-react';

interface ProductMobileActionBarProps {
  isOutOfStock: boolean;
  isWishlisted: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onToggleWishlist: () => void;
  onConsultation: () => void;
}

/**
 * Mobile-viewport fixed bottom action bar.
 * Provides thumb-accessible checkout and consultation triggers.
 */
export default function ProductMobileActionBar({
  isOutOfStock,
  isWishlisted,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onConsultation,
}: ProductMobileActionBarProps) {
  return (
    <aside 
      aria-label="Mobile Actions" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-2">
        {/* Quick WhatsApp Consultation */}
        <button
          onClick={onConsultation}
          className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 flex items-center justify-center shrink-0 cursor-pointer"
          title="Konsultasi WhatsApp"
        >
          <MessageCircle size={18} />
        </button>

        {/* Quick Wishlist Toggle */}
        <button
          onClick={onToggleWishlist}
          className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-red-500 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          title="Wishlist"
        >
          <Heart size={18} className={isWishlisted ? 'text-red-500 fill-red-500' : ''} />
        </button>

        {/* + Keranjang (Secondary Action) */}
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className="flex-1 h-10 rounded-xl bg-white border-2 border-[var(--color-primary-green)] text-[var(--color-primary-green)] font-bold text-xs text-center flex items-center justify-center gap-1 active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          <Plus size={15} />
          Keranjang
        </button>

        {/* Beli Sekarang (Primary Action) */}
        <button
          onClick={onBuyNow}
          disabled={isOutOfStock}
          className="flex-1 h-10 rounded-xl bg-[var(--color-primary-green)] text-white font-bold text-xs text-center shadow-xs flex items-center justify-center gap-1 active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          <ShoppingBag size={15} />
          Beli Sekarang
        </button>
      </div>
    </aside>
  );
}
