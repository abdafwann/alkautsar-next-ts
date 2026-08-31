'use client';

import { 
  Minus, 
  Plus, 
  MessageCircle, 
  Heart, 
  Share2, 
  ShoppingBag,
  Zap
} from 'lucide-react';

interface ProductPurchaseBoxProps {
  quantity: number;
  maxStock: number;
  unitPrice: number;
  originalPrice?: number;
  isWishlisted: boolean;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onToggleWishlist: () => void;
  onShare: () => void;
  onConsultation: () => void;
}

/**
 * Clean & ergonomic purchase action box.
 * Free from redundant action buttons and cluttered layout.
 */
export default function ProductPurchaseBox({
  quantity,
  maxStock,
  unitPrice,
  originalPrice,
  isWishlisted,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onShare,
  onConsultation,
}: ProductPurchaseBoxProps) {
  const formattedSubtotal = new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(unitPrice * quantity);

  const formattedOriginalSubtotal = originalPrice
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(originalPrice * quantity)
    : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Main Sticky Purchase Action Box */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs sticky top-20">
        <h3 className="font-bold text-text-main text-sm mb-4">Jumlah Pembelian</h3>

        {/* Quantity Stepper & Stock */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-9 w-32 bg-bg-light">
            <button 
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-full flex items-center justify-center text-text-main hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Kurangi jumlah"
            >
              <Minus size={14} />
            </button>
            <input 
              type="text" 
              value={quantity} 
              readOnly 
              className="w-full text-center font-bold text-text-main border-none bg-transparent focus:ring-0 p-0 text-sm" 
            />
            <button 
              onClick={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
              disabled={quantity >= maxStock}
              className="w-10 h-full flex items-center justify-center text-primary-green hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Tambah jumlah"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-xs text-text-main/70">
            Sisa Stok: <span className="font-bold text-text-main">{maxStock}</span>
          </div>
        </div>

        {/* Subtotal Calculation */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mb-4">
          <span className="text-xs text-text-main/60 font-medium">Subtotal Pesanan</span>
          <div className="text-right">
            {formattedOriginalSubtotal && (
              <div className="text-[11px] text-gray-400 line-through leading-tight">{formattedOriginalSubtotal}</div>
            )}
            <div className="text-xl font-extrabold text-text-main leading-tight">{formattedSubtotal}</div>
          </div>
        </div>

        {/* Two Clear Primary Action Buttons */}
        <div className="flex flex-col gap-2.5 mb-4">
          {/* + Keranjang (Solid Green) */}
          <button
            onClick={onAddToCart}
            disabled={maxStock < 1}
            className="w-full h-11 rounded-xl bg-primary-green hover:bg-primary-green-hover text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <ShoppingBag size={16} />
            <span>Tambah ke Keranjang</span>
          </button>

          {/* Beli Langsung (Green Outline) */}
          <button
            onClick={onBuyNow}
            disabled={maxStock < 1}
            className="w-full h-11 rounded-xl bg-white hover:bg-secondary-green/60 text-primary-green border border-primary-green font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Zap size={16} />
            <span>Beli Sekarang</span>
          </button>
        </div>

        {/* Standard Action Footer (Chat | Wishlist | Share) */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-600 font-medium px-2">
          <button 
            onClick={onConsultation}
            className="flex items-center gap-1 hover:text-primary-green transition-colors cursor-pointer"
            title="Chat dengan Herbalis"
          >
            <MessageCircle size={14} className="text-[#25D366]" />
            <span>Chat</span>
          </button>
          
          <div className="w-px h-3.5 bg-gray-200"></div>
          
          <button 
            onClick={onToggleWishlist}
            className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
            title="Simpan ke Wishlist"
          >
            <Heart size={14} className={isWishlisted ? 'text-rose-500 fill-rose-500' : ''} />
            <span>{isWishlisted ? 'Tersimpan' : 'Wishlist'}</span>
          </button>
          
          <div className="w-px h-3.5 bg-gray-200"></div>
          
          <button 
            onClick={onShare}
            className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
            title="Bagikan Produk"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
