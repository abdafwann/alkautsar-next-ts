'use client';

import { ChatCircleDots, Heart, Plus, ShoppingBag } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface ProductMobileActionBarProps {
  isOutOfStock: boolean;
  isWishlisted: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onToggleWishlist: () => void;
  onConsultation: () => void;
}

/*
 * Bilah aksi mobile yang dipasang melayang tetap di bagian bawah layar (fixed bottom) 
 * guna mempermudah jangkauan ibu jari (thumb-zone) pengguna ponsel pintar saat berbelanja
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
      aria-label="Aksi Cepat Pembelian Mobile" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-2">
        {/*
         * Tombol konsultasi WhatsApp cepat untuk konsultasi keluhan kesehatan langsung dari viewport mobile
         */}
        <button
          type="button"
          onClick={onConsultation}
          className="w-10 h-10 rounded-xl bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          title="Konsultasi WhatsApp"
          aria-label="Konsultasi kesehatan via WhatsApp"
        >
          <ChatCircleDots size={20} weight="fill" />
        </button>

        {/*
         * Tombol toggle wishlist mobile dengan feedback perubahan status terisi (fill)
         */}
        <button
          type="button"
          onClick={onToggleWishlist}
          className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-rose-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95"
          title="Wishlist"
          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
        >
          <Heart 
            size={20} 
            weight={isWishlisted ? 'fill' : 'regular'} 
            className={isWishlisted ? 'text-rose-600' : ''} 
          />
        </button>

        {/*
         * Aksi sekunder: Tambah ke Keranjang bagi pembeli yang masih ingin mencari produk herbal lainnya
         */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddToCart}
          disabled={isOutOfStock}
          leftIcon={<Plus size={14} weight="bold" />}
          className="flex-1 h-10 text-xs font-bold border-primary-green text-primary-green hover:bg-primary-green/5 hover:border-primary-green shadow-none"
        >
          Keranjang
        </Button>

        {/*
         * Aksi primer: Beli Sekarang langsung memicu checkout bagi pembeli dengan niat beli tinggi
         */}
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onBuyNow}
          disabled={isOutOfStock}
          leftIcon={<ShoppingBag size={14} weight="bold" />}
          className="flex-1 h-10 text-xs font-bold shadow-2xs"
        >
          Beli Sekarang
        </Button>
      </div>
    </aside>
  );
}
