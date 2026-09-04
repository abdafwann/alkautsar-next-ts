'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from '@phosphor-icons/react';

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface FeaturedCategoriesV2Props {
  categories: Category[];
}

const CATEGORY_EDITORIALS = [
  {
    name: 'Sakit Tenggorokan',
    slug: 'sakit-tenggorokan',
    tagline: 'Madu hutan murni, perasan jeruk nipis, dan rimpang alami pereda radang serta batuk.',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&auto=format&fit=crop&q=80',
    itemCount: '8 Formula',
  },
  {
    name: 'Metabolisme Tubuh',
    slug: 'metabolisme-tubuh',
    tagline: 'Kombinasi rimpang temulawak dan jahe merah untuk penyerapan nutrisi dan daya tahan.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    itemCount: '12 Formula',
  },
  {
    name: 'Penurun Berat Badan',
    slug: 'penurun-berat-badan',
    tagline: 'Seduhan teh hijau dan daun jati cina alami untuk membersihkan sisa lemak dan pencernaan.',
    imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80',
    itemCount: '6 Formula',
  },
];

export default function FeaturedCategoriesV2({ categories }: FeaturedCategoriesV2Props) {
  // Merge dynamic DB categories with curated editorial assets
  const list = categories && categories.length > 0 ? categories.slice(0, 3) : [];
  const items = [0, 1, 2].map((idx) => {
    const cat = list[idx];
    const fallback = CATEGORY_EDITORIALS[idx % CATEGORY_EDITORIALS.length];
    return {
      id: cat?.id || `cat-${idx}`,
      name: cat?.name || fallback.name,
      tagline: cat?.description && cat.description.length > 15 ? cat.description : fallback.tagline,
      imageUrl: cat?.imageUrl || fallback.imageUrl,
      itemCount: fallback.itemCount,
    };
  });

  return (
    <section className="py-12 md:py-16 bg-white border-b border-[#ede8de]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-5 border-b border-[#e5dfd3]">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-2">
              Koleksi Berdasarkan Kebutuhan
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main tracking-tight">
              Kategori Herbal <span className="italic font-normal text-accent-brown">Pilihan</span>
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-main hover:text-primary-green transition-colors group"
          >
            <span>Buka Semua Kategori</span>
            <ArrowUpRight size={16} className="text-text-main/60 group-hover:text-primary-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>

        {/* 3 Clean Editorial Gallery Cards (No forced dark overlays) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/shop?category=${item.id}`}
              className="group block"
            >
              {/* Image Frame with Warm Natural Background */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#f0eae1] mb-5 border border-[#e8e2d8]">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                />
                
                {/* Subtle Clean Pill on Corner */}
                <div className="absolute top-3.5 right-3.5 bg-white px-3 py-1 rounded-full text-[11px] font-semibold text-text-main border border-gray-200/80 shadow-2xs">
                  {item.itemCount}
                </div>
              </div>

              {/* Editorial Typography (Placed cleanly outside the photo) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-text-main group-hover:text-primary-green transition-colors">
                    {item.name}
                  </h3>
                  <div className="w-7 h-7 rounded-full bg-white border border-[#e5dfd3] flex items-center justify-center text-text-main group-hover:bg-primary-green group-hover:text-white group-hover:border-primary-green transition-all duration-300 shadow-2xs">
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                <p className="text-xs text-text-main/65 leading-relaxed">
                  {item.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
