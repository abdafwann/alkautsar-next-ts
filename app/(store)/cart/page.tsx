'use client';

import Link from 'next/link';
import { ChevronRight, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';
import { updateDbCartItem, removeFromDbCart, clearDbCart } from '@/app/actions/cart';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
    updateDbCartItem(id, quantity).catch(console.error);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    removeFromDbCart(id).catch(console.error);
  };

  const handleClearCart = () => {
    clearCart();
    clearDbCart().catch(console.error);
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPrice);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-bold">Keranjang Belanja</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja ({totalItems} produk)</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <ShoppingCart size={64} className="text-gray-200 mb-6" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">Keranjangmu masih kosong</h2>
            <p className="text-gray-400 text-sm mb-8">Yuk mulai belanja produk herbal berkualitas!</p>
            <Link 
              href="/shop" 
              className="bg-primary-green text-white font-bold rounded-xl px-8 py-3 hover:bg-primary-green-hover transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-500">
                <div className="col-span-5">Produk</div>
                <div className="col-span-2 text-center">Harga</div>
                <div className="col-span-3 text-center">Jumlah</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {items.map((item) => {
                const itemPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price);
                const itemSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price * item.quantity);

                return (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white rounded-2xl p-4 md:px-6 md:py-5 shadow-sm border border-gray-100">
                    {/* Product Info */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-2">
                        <img src={item.imageUrl} alt={item.title} className="max-h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/product/${item.slug}`} className="font-bold text-gray-900 text-sm hover:text-primary-green transition-colors line-clamp-2">
                          {item.title}
                        </Link>
                        {item.discountPercentage && (
                          <span className="inline-block mt-1 bg-green-100 text-primary-green text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Hemat {item.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 text-center">
                      <span className="text-sm font-semibold text-gray-700">{itemPrice}</span>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-3 flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-green hover:text-primary-green transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-green hover:text-primary-green transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="md:col-span-2 text-right">
                      <span className="text-sm font-bold text-primary-green">{itemSubtotal}</span>
                    </div>
                  </div>
                );
              })}

              {/* Clear Cart */}
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleClearCart}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Kosongkan Keranjang
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Ringkasan Pesanan</h3>
                
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({totalItems} produk)</span>
                    <span className="font-semibold text-gray-900">{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ongkos Kirim</span>
                    <span className="font-semibold text-primary-green">Gratis</span>
                  </div>
                </div>

                <hr className="border-gray-100 mb-4" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary-green">{formattedTotal}</span>
                </div>

                <button className="w-full bg-primary-green text-white font-bold rounded-xl py-4 hover:bg-primary-green-hover transition-colors text-sm shadow-lg shadow-green-100">
                  Lanjut ke Pembayaran
                </button>

                <Link 
                  href="/shop" 
                  className="block w-full text-center mt-3 text-sm text-gray-500 hover:text-primary-green transition-colors font-medium py-2"
                >
                  ← Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
