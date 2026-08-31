'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promoPrice: number | null;
  promoExpiry: string | null;
  images: { id: string; url: string }[];
  category?: { id: string; name: string } | null;
  bpomNumber?: string | null;
}

interface HealthProblemFinderProps {
  products: ProductItem[];
}

const HEALTH_PROBLEMS = [
  {
    id: 'sendi',
    title: 'Asam Urat & Nyeri Sendi',
    icon: '🦴',
    tag: 'Nyeri Sendi & Pegal Linu',
    keywords: ['samuratik', 'langtugin', 'urat', 'sendi', 'linu', 'rematik'],
    color: 'from-amber-500/10 to-orange-500/10',
    accent: 'text-amber-700 bg-amber-50',
    description: 'Bantu redakan pembengkakan sendi, buang kelebihan purin, dan pulihkan kelenturan gerak.',
  },
  {
    id: 'diabetes',
    title: 'Gula Darah & Diabetes',
    icon: '🩸',
    tag: 'Stabil Gula Darah',
    keywords: ['diabet', 'gula', 'insulin', 'mahoni', 'sambiloto'],
    color: 'from-emerald-500/10 to-teal-500/10',
    accent: 'text-emerald-700 bg-emerald-50',
    description: 'Membantu menurunkan kadar glukosa, memulihkan sensitivitas insulin alami, dan jaga tenaga.',
  },
  {
    id: 'kolesterol',
    title: 'Kolesterol & Hipertensi',
    icon: '🫀',
    tag: 'Tensi & Jantung Sehat',
    keywords: ['kolesterol', 'tensi', 'jantung', 'bawang', 'sukun'],
    color: 'from-rose-500/10 to-red-500/10',
    accent: 'text-rose-700 bg-rose-50',
    description: 'Melancarkan peredaran darah, meredakan kaku leher, dan mengikis plak kolesterol jahat.',
  },
  {
    id: 'lambung',
    title: 'Maag & Asam Lambung',
    icon: '🌿',
    tag: 'Lambung Tenang & Nyaman',
    keywords: ['lambung', 'maag', 'gastro', 'kunyit', 'madu'],
    color: 'from-lime-500/10 to-emerald-500/10',
    accent: 'text-emerald-700 bg-emerald-50',
    description: 'Lapisi dinding lambung, redakan sensasi perih/mual, dan hilangkan rasa begah di dada.',
  },
  {
    id: 'pernapasan',
    title: 'Batuk, Paru & Pernapasan',
    icon: '🫁',
    tag: 'Pernapasan Lega',
    keywords: ['gurah', 'batuk', 'paru', 'lendir', 'asma', 'nafas'],
    color: 'from-cyan-500/10 to-blue-500/10',
    accent: 'text-cyan-700 bg-cyan-50',
    description: 'Keluarkan dahak/lendir menumpuk, redakan batuk berkepanjangan, dan legakan saluran napas.',
  },
  {
    id: 'stamina',
    title: 'Daya Tahan & Stamina',
    icon: '🛡️',
    tag: 'Energi & Imunitas',
    keywords: ['habbatus', 'stamina', 'daya tahan', 'zaitun', 'madu', 'vital'],
    color: 'from-amber-500/10 to-yellow-500/10',
    accent: 'text-amber-800 bg-amber-50',
    description: 'Perkuat imunitas tubuh dari serangan virus, pulihkan kebugaran, dan cegah rasa mudah lelah.',
  },
];

function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function HealthProblemFinder({ products }: HealthProblemFinderProps) {
  const [selectedId, setSelectedId] = useState(HEALTH_PROBLEMS[0].id);
  const addItem = useCartStore((s) => s.addItem);

  const activeProblem = HEALTH_PROBLEMS.find((p) => p.id === selectedId) || HEALTH_PROBLEMS[0];

  // Match products based on keywords or category
  const matchedProducts = products.filter((p) => {
    const text = (p.name + ' ' + (p.description || '') + ' ' + (p.category?.name || '')).toLowerCase();
    return activeProblem.keywords.some((kw) => text.includes(kw));
  });

  // If no matching product found from keywords, fallback to first 3 products
  const displayProducts = matchedProducts.length > 0 ? matchedProducts.slice(0, 3) : products.slice(0, 3);

  const handleAddToCart = (product: ProductItem) => {
    const imgUrl = product.images?.[0]?.url || '';
    const finalPrice = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price;

    addItem({
      id: product.id,
      title: product.name,
      price: finalPrice,
      imageUrl: imgUrl,
      slug: product.slug,
    });

    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  return (
    <section id="solusi-keluhan" className="py-16 md:py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full inline-block mb-3">
            Panduan Solusi Alami
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
            Apa Keluhan Kesehatan yang Sedang Anda Rasakan?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            Tidak perlu bingung mencari nama tanaman. Pilih keluhan Anda, kami tampilkan formula herbal yang terbukti tepat sasaran.
          </p>
        </div>

        {/* 6 Problem Selection Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {HEALTH_PROBLEMS.map((prob) => {
            const isSelected = prob.id === selectedId;
            return (
              <button
                key={prob.id}
                type="button"
                onClick={() => setSelectedId(prob.id)}
                className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? 'bg-[var(--color-primary-green)] text-white shadow-md scale-102 ring-2 ring-[var(--color-primary-green)]/20'
                    : 'bg-[#f8fafc] hover:bg-emerald-50/50 text-gray-800 border border-gray-100 hover:border-emerald-200'
                }`}
              >
                <div className="text-2xl mb-2">{prob.icon}</div>
                <div>
                  <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {prob.title}
                  </p>
                  <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {prob.tag}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Highlighted Solutions Shelf */}
        <div className="bg-gradient-to-br from-[#f8fbf9] to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-emerald-100/60 shadow-xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-emerald-100/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeProblem.icon}</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  Rekomendasi Herbal untuk {activeProblem.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                {activeProblem.description}
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-green)] hover:underline shrink-0"
            >
              <span>Lihat Semua Produk</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => {
              const imgUrl = product.images?.[0]?.url;
              const isDiscounted = product.promoPrice && product.promoPrice > 0;
              const displayPrice = isDiscounted ? product.promoPrice! : product.price;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4.5 border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Showcase */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="block relative w-full h-48 bg-[#fbfdfc] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-3"
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
                      
                      {/* BPOM Tag Badge */}
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-700 px-2 py-0.5 rounded-md border border-gray-100 shadow-2xs">
                        POM TR Terdaftar
                      </span>
                    </Link>

                    {/* Product Details */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {product.category?.name || 'Herbal Alami'}
                      </span>
                      <Link href={`/product/${product.slug}`}>
                        <h4 className="font-bold text-sm text-gray-900 hover:text-[var(--color-primary-green)] transition-colors mt-1.5 line-clamp-1">
                          {product.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description || 'Formula herbal konsentrasi tinggi berkhasiat menjaga kesehatan tubuh.'}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                    <div>
                      {isDiscounted && (
                        <p className="text-[11px] text-gray-400 line-through">
                          {formatRupiah(product.price)}
                        </p>
                      )}
                      <p className="text-sm font-extrabold text-[var(--color-primary-green)]">
                        {formatRupiah(displayPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-[var(--color-primary-green)] text-[var(--color-primary-green)] hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingBag size={13} />
                        <span>+ Keranjang</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
