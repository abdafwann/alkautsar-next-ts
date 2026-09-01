'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { ProductItem } from './HealthProblemFinder';

interface CuratedProductsShowcaseProps {
  products: ProductItem[];
}

function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function CuratedProductsShowcase({ products }: CuratedProductsShowcaseProps) {
  const addItem = useCartStore((s) => s.addItem);
  const now = new Date();

  // Take top 4-8 products
  const featured = products.slice(0, 8);

  const handleAddToCart = (product: ProductItem) => {
    const imgUrl = product.images?.[0]?.url || '';
    const isPromoValid = product.promoPrice && product.promoPrice > 0 && (!product.promoExpiry || new Date(product.promoExpiry) >= now);
    const finalPrice = isPromoValid ? product.promoPrice! : product.price;

    addItem({
      id: product.id,
      title: product.name,
      price: finalPrice,
      imageUrl: imgUrl,
      slug: product.slug,
    });

    toast.success(`${product.name} berhasil ditambahkan!`);
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full inline-block mb-3">
              Produk Pilihan Utama
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Formula Herbal Terpercaya & Teruji
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">
              Setiap botol diproduksi dengan standar higienis CPOTB, memiliki izin edar resmi BPOM, dan halal untuk konsumsi harian.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-primary-green)] hover:text-emerald-800 transition-colors"
          >
            <span>Buka Seluruh Katalog ({products.length} Produk)</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => {
            const imgUrl = product.images?.[0]?.url;
            const isPromoValid = product.promoPrice && product.promoPrice > 0 && (!product.promoExpiry || new Date(product.promoExpiry) >= now);
            const displayPrice = isPromoValid ? product.promoPrice! : product.price;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <Link
                    href={`/product/${product.slug}`}
                    className="block relative w-full h-52 bg-[#f8faf9] rounded-xl overflow-hidden mb-4 flex items-center justify-center p-4"
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-3xl">🌿</span>
                        <p className="text-xs font-bold text-gray-700 mt-1">{product.name}</p>
                      </div>
                    )}

                    {/* Quality Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-800 px-2 py-0.5 rounded-md border border-gray-100 shadow-2xs">
                        BPOM RI
                      </span>
                      {isPromoValid && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                          Hemat Khusus
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Category & Title */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {product.category?.name || 'Herbal Pilihan'}
                    </span>

                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-bold text-sm text-gray-900 hover:text-[var(--color-primary-green)] transition-colors mt-2 line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description || 'Ekstrak herbal alami berkhasiat menjaga dan memulihkan kesehatan tubuh.'}
                    </p>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                  <div>
                    {isPromoValid && (
                      <p className="text-[11px] text-gray-400 line-through">
                        {formatRupiah(product.price)}
                      </p>
                    )}
                    <p className="text-sm font-extrabold text-[var(--color-primary-green)]">
                      {formatRupiah(displayPrice)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-[var(--color-primary-green)] text-[var(--color-primary-green)] hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Tambah ke Keranjang"
                  >
                    <ShoppingBag size={13} />
                    <span>+ Beli</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
