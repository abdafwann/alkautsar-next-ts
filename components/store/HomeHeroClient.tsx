'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, WhatsappLogo, CheckCircle, ShieldCheck, Plant } from '@phosphor-icons/react';
import { useState } from 'react';

interface HomeHeroClientProps {
  storeName: string;
  bannerUrl: string;
}

export default function HomeHeroClient({ storeName, bannerUrl }: HomeHeroClientProps) {
  const [mainImgSrc, setMainImgSrc] = useState(
    bannerUrl && !bannerUrl.includes('googleusercontent')
      ? bannerUrl
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=85'
  );

  return (
    <section className="relative bg-[#fbf9f5] border-b border-[#eae4d7] overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20">
      
      {/* Subtle Botanical Ambient Glow */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-[#00AA5B]/4 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] bg-[#8B5A2B]/4 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Editorial Headline & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">

            {/* Display Headline - Direct & Bold */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif font-bold text-[#111827] tracking-tight leading-[1.15] mb-5">
              Solusi Kesehatan Alami Keluarga dari <span className="italic font-normal text-[var(--color-dark-green)] underline decoration-[var(--color-primary-green)]/35 decoration-wavy decoration-2 underline-offset-8">Herbal Pilihan</span>.
            </h1>

            {/* Concise Value Proposition */}
            <p className="text-base md:text-lg text-[#4b5563] leading-relaxed mb-8 max-w-xl">
              Pilihan formula herbal murni berkualitas tinggi dari bahan alami terstandar. Aman, halal, dan berkhasiat membantu menjaga daya tahan serta kebugaran tubuh harian Anda.
            </p>

            {/* Direct Action Pair */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2.5 bg-[#00AA5B] hover:bg-[#008f4c] active:scale-[0.98] text-white font-semibold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 text-sm md:text-base group"
              >
                <span>Belanja Sekarang</span>
                <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Al-Kautsar%20Herbal,%20saya%20ingin%20tanya%20produk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-[0.98] text-[#1f2937] border border-[#d1d5db] font-semibold px-6 py-3.5 rounded-xl transition-all duration-150 text-sm md:text-base shadow-2xs hover:border-gray-400"
              >
                <WhatsappLogo size={20} weight="duotone" className="text-[#00AA5B]" />
                <span>Konsultasi Produk</span>
              </a>
            </div>

            {/* Trust Standard Strip */}
            <div className="pt-6 border-t border-[#e5e0d3] flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-[#374151]">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle size={17} weight="fill" className="text-[#00AA5B] shrink-0" />
                <span>100% Produk Original</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle size={17} weight="fill" className="text-[#00AA5B] shrink-0" />
                <span>Terdaftar Resmi BPOM</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle size={17} weight="fill" className="text-[#00AA5B] shrink-0" />
                <span>Sertifikat Halal MUI</span>
              </div>
            </div>

          </div>

          {/* Right Column: Editorial Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Showcase Image Frame */}
              <div className="relative h-[360px] sm:h-[430px] lg:h-[470px] w-full rounded-2xl overflow-hidden shadow-xl border border-[#e5dfd2] bg-white group">
                <Image
                  src={mainImgSrc}
                  alt={`${storeName} Herbal Alami`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={() => {
                    setMainImgSrc('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=85');
                  }}
                />
                
                {/* Clean Inset Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

                {/* Bottom Story Caption (Unobstructed typography) */}
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <div className="inline-flex items-center gap-1.5 bg-[#122b1c]/90 border border-white/20 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide mb-2">
                    <Plant size={14} weight="duotone" className="text-[#52d694]" />
                    <span>Bahan Alami Nusantara</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-white/95 leading-relaxed drop-shadow-sm max-w-sm">
                    Kualitas ekstrak herbal murni pilihan langsung ke tangan keluarga Anda.
                  </p>
                </div>
              </div>

              {/* Side Floating Authenticity Badge (Positioned at Top-Right without overlapping text) */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-[#e5dfd2] items-center gap-3 z-20 transition-transform hover:-translate-y-0.5">
                <div className="w-9 h-9 rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[#00AA5B] shrink-0 font-bold text-base">
                  <ShieldCheck size={20} weight="duotone" className="text-[#00AA5B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">Jaminan Asli 100%</p>
                  <p className="text-[11px] text-gray-500">Official Brand Store</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
