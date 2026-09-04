'use client';

import { 
  ChatCircleDots, 
  Heart, 
  ShareNetwork, 
  ShoppingBag,
  Lightning
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QuantityStepper } from '@/components/cart/QuantityStepper';

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
      {/*
       * Panel aksi pembelian dibuat sticky (top-20) pada layar desktop agar pelanggan 
       * dapat langsung melakukan pemesanan tanpa harus menggulir kembali ke atas halaman
       */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs sticky top-20">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Jumlah Pembelian</h3>

        {/*
         * Kontrol kuantitas dibatasi antara 1 hingga maxStock aktual dari inventaris fisik 
         * menggunakan komponen standar QuantityStepper guna menjamin keseragaman aksesibilitas
         */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <QuantityStepper
            value={quantity}
            min={1}
            max={maxStock}
            disabled={maxStock < 1}
            onDecrement={() => onQuantityChange(Math.max(1, quantity - 1))}
            onIncrement={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
            itemTitle="produk"
          />

          <div className="text-xs text-right">
            {maxStock < 1 ? (
              <Badge variant="danger" size="sm">Stok Habis</Badge>
            ) : maxStock <= 5 ? (
              <div className="flex flex-col items-end gap-0.5">
                <Badge variant="warning" size="sm">Sisa {maxStock} Item</Badge>
                <span className="text-[10px] text-amber-700 font-medium">Stok Menipis</span>
              </div>
            ) : (
              <span className="text-gray-500">
                Sisa Stok: <span className="font-bold text-gray-900 font-mono">{maxStock}</span>
              </span>
            )}
          </div>
        </div>

        {/*
         * Rincian subtotal dihitung langsung sesuai kuantitas terpilih guna memberi transparansi 
         * nominal tagihan sebelum dialihkan ke alur transaksi
         */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3.5 mb-4">
          <span className="text-xs text-gray-500 font-medium">Subtotal Pesanan</span>
          <div className="text-right">
            {formattedOriginalSubtotal && (
              <div className="text-[11px] text-gray-400 line-through leading-tight">{formattedOriginalSubtotal}</div>
            )}
            <div className="text-xl font-extrabold text-primary-green font-mono leading-tight">{formattedSubtotal}</div>
          </div>
        </div>

        {/*
         * Pemisahan tombol utama (Tambah ke Keranjang) dan sekunder (Beli Sekarang) 
         * menggunakan Button resmi design system dengan icon Phosphor dan tactile feedback
         */}
        <div className="flex flex-col gap-2.5 mb-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onAddToCart}
            disabled={maxStock < 1}
            leftIcon={<ShoppingBag size={17} weight="bold" />}
            className="w-full h-11 text-xs sm:text-sm font-bold rounded-lg shadow-2xs"
          >
            Tambah ke Keranjang
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onBuyNow}
            disabled={maxStock < 1}
            leftIcon={<Lightning size={17} weight="fill" className="text-primary-green" />}
            className="w-full h-11 text-xs sm:text-sm font-bold rounded-lg border-primary-green text-primary-green hover:bg-primary-green/5"
          >
            Beli Sekarang
          </Button>
        </div>

        {/*
         * Baris aksi komplementer (Chat Herbalis, Wishlist, Share) melengkapi alur edukasi 
         * bagi pelanggan yang membutuhkan konfirmasi dosis sebelum membeli
         */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-600 font-medium px-2">
          <button 
            type="button"
            onClick={onConsultation}
            className="flex items-center gap-1 hover:text-primary-green transition-colors cursor-pointer"
            title="Konsultasi Herbalis via WhatsApp"
            aria-label="Konsultasi dengan herbalis"
          >
            <ChatCircleDots size={16} weight="fill" className="text-[#25D366]" />
            <span>Chat</span>
          </button>
          
          <div className="w-px h-3.5 bg-gray-200" />
          
          <button 
            type="button"
            onClick={onToggleWishlist}
            className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
            title="Simpan produk ke wishlist"
            aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
          >
            <Heart 
              size={16} 
              weight={isWishlisted ? 'fill' : 'regular'} 
              className={isWishlisted ? 'text-rose-500' : ''} 
            />
            <span>{isWishlisted ? 'Tersimpan' : 'Wishlist'}</span>
          </button>
          
          <div className="w-px h-3.5 bg-gray-200" />
          
          <button 
            type="button"
            onClick={onShare}
            className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
            title="Bagikan tautan produk"
            aria-label="Bagikan produk"
          >
            <ShareNetwork size={16} weight="bold" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
