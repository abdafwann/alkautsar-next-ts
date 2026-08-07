'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Heart, Zap } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ProductActionsProps {
  product: {
    id: string;
    title: string;
    price: number;
    promoPrice: number | null;
    image: string;
    quantity: number; // stok
    slug?: string;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  
  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);
  const stock = product.quantity;
  const currentPrice = product.promoPrice ? product.promoPrice : product.price;

  const handleDecrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrease = () => {
    if (qty < stock) setQty(qty + 1);
  };

  const handleAddToCart = async () => {
    if (stock < 1) return;
    setIsAdding(true);
    
    // Simulasikan delay jaringan kecil untuk UX yang lebih mantap
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      id: product.id,
      title: product.title,
      price: currentPrice,
      imageUrl: product.image,
      slug: product.slug || '',
    }, qty);
    
    setIsAdding(false);
    toast.success(`${qty} ${product.title} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    if (stock < 1) return;
    // Skenario Beli Langsung: Masukkan ke keranjang, lalu redirect ke Cart/Checkout
    addItem({
      id: product.id,
      title: product.title,
      price: currentPrice,
      imageUrl: product.image,
      slug: product.slug || '',
    }, qty);
    router.push('/cart'); // Saat ini diarahkan ke Cart. Nantinya bisa diarahkan langsung ke /checkout
  };

  const formattedSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentPrice * qty);

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm sticky top-32">
      <h3 className="font-bold text-gray-900 mb-4">Atur Jumlah & Catatan</h3>
      
      {/* Kontrol Kuantitas */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10 w-32">
          <button 
            onClick={handleDecrease}
            disabled={qty <= 1}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 h-full flex items-center justify-center font-semibold text-sm border-x border-gray-300 bg-gray-50">
            {qty}
          </div>
          <button 
            onClick={handleIncrease}
            disabled={qty >= stock}
            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="text-sm">
          Stok Tersisa: <span className="font-bold text-gray-900">{stock}</span>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
        <span className="text-gray-500">Subtotal</span>
        <span className="text-xl font-bold text-gray-900">{formattedSubtotal}</span>
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={handleAddToCart}
          disabled={stock < 1 || isAdding}
          className="w-full bg-primary-green hover:bg-primary-green-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <ShoppingCart size={18} />
              Masukkan Keranjang
            </>
          )}
        </button>
        
        <button 
          onClick={handleBuyNow}
          disabled={stock < 1}
          className="w-full bg-white hover:bg-gray-50 text-primary-green border border-primary-green font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap size={18} />
          Beli Langsung
        </button>
      </div>

      {/* Wishlist */}
      <div className="mt-4 flex justify-center">
        <button 
          onClick={() => toggleWishlist(product)}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
            isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
          {isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
        </button>
      </div>
    </div>
  );
}
