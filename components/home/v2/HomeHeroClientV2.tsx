'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, MessageCircle, HeartHandshake, CheckCircle2, Leaf, Award } from 'lucide-react';

interface HomeHeroClientV2Props {
  storeName: string;
  bannerUrl: string;
  heroProduct?: any;
}

/**
 * Minimalist Elegant Hero Section (V2) for /homeclient.
 * Combines authentic photo collage, store branding, and fluid entrance animations.
 */
export default function HomeHeroClientV2({ storeName, bannerUrl, heroProduct }: HomeHeroClientV2Props) {
  const heroImgUrl = heroProduct?.images?.[0]?.url || bannerUrl;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7faf7] via-white to-white pt-6 pb-16 md:pt-12 md:pb-24">
      {/* Subtle organic background aura */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-amber-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Value Proposition & High-Trust Copy */}
          <motion.div
            className="lg:col-span-6 flex flex-col items-start text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Trust Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[var(--color-primary-green)] text-xs font-bold mb-5 shadow-2xs">
              <Sparkles size={14} className="text-emerald-600" />
              <span>Standar Farmasi Herbal BPOM & Halal MUI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text-main)] tracking-tight leading-[1.15] mb-5">
              Solusi Sehat Alami{' '}
              <span className="text-[var(--color-dark-green)] underline decoration-[var(--color-primary-green)]/35 decoration-wavy decoration-2 underline-offset-8">
                {storeName}
              </span>{' '}
              Tanpa Beban Kimia
            </h1>

            {/* Subtext: Focused & Jargon-Free */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-[50ch]">
              Formula ekstrak herbal terstandar untuk merawat asam urat, gula darah, lambung, dan stamina harian seluruh keluarga secara aman & terbukti.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--color-primary-green)] hover:bg-[var(--color-primary-green-hover)] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
              >
                <span>Jelajahi Produk Herbal</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Herbalis%20Al-Kautsar,%20saya%20ingin%20konsultasi%20keluhan%20kesehatan%20saya."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-emerald-50/50 text-gray-800 text-sm font-bold rounded-xl border border-gray-200 hover:border-emerald-200 transition-all cursor-pointer shadow-2xs"
              >
                <MessageCircle size={17} className="text-emerald-600" />
                <span>Konsultasi Herbalis Gratis</span>
              </a>
            </div>

            {/* Direct Trust Proof Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-primary-green)] shrink-0" />
                <span className="text-xs font-semibold text-gray-700">BPOM Resmi RI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-primary-green)] shrink-0" />
                <span className="text-xs font-semibold text-gray-700">100% Halal MUI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-primary-green)] shrink-0" />
                <span className="text-xs font-semibold text-gray-700">Tanpa BKO Kimia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-primary-green)] shrink-0" />
                <span className="text-xs font-semibold text-gray-700">Bisa Bayar COD</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Multi-Photo Visual Collage */}
          <motion.div
            className="lg:col-span-6 relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Main Focal Showcase Frame */}
            <div className="relative w-full max-w-[460px] bg-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 transition-transform duration-300 hover:-translate-y-1">
              
              {/* Focal Visual Container */}
              <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-[#f3f8f4] to-emerald-50/40 rounded-2xl flex items-center justify-center overflow-hidden p-6 group">
                <img
                  src={heroImgUrl}
                  alt={`${storeName} Showcase`}
                  className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-106 transition-transform duration-500"
                />

                {/* Floating Assurance Pill */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/60 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[var(--color-primary-green)]" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-900 leading-tight">Teruji Klinis BPOM</p>
                      <p className="text-[10px] text-gray-500">Aman untuk konsumsi harian</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Grade A+
                  </span>
                </div>
              </div>

              {/* Companion Photo Strip Below Hero */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                
                {/* Visual Thumbnail 1: Kebun Herbal */}
                <div className="relative rounded-xl overflow-hidden h-20 group border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80"
                    alt="Kebun Herbal Alami"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-bold text-white leading-tight flex items-center gap-1">
                      <Leaf size={11} className="text-emerald-400" />
                      100% Bahan Segar
                    </span>
                  </div>
                </div>

                {/* Visual Thumbnail 2: Laboratorium CPOTB */}
                <div className="relative rounded-xl overflow-hidden h-20 group border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80"
                    alt="Standar Laboratorium Farmasi"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-bold text-white leading-tight flex items-center gap-1">
                      <Award size={11} className="text-amber-400" />
                      Standar CPOTB
                    </span>
                  </div>
                </div>

              </div>

              {/* Social Proof Counter Bar */}
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <HeartHandshake size={16} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-800">50.000+ Keluarga Terbantu</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                  ★ 4.9 / 5.0 Ulasan
                </span>
              </div>

            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
