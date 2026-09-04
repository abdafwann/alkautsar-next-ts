'use client';

import Link from 'next/link';
import { Plant, Flask, ShieldCheck, Package, CheckCircle, ArrowUpRight } from '@phosphor-icons/react';

/**
 * TasteSkill v2 - Asymmetrical Bento Grid Section
 * Replaces the cliché "3 icon boxes in a row" with an editorial, high-authority craft & trust story.
 */
export default function WhyAlKautsarBento() {
  return (
    <section className="py-12 md:py-16 bg-[#fdfcf9] border-b border-[#ede8de]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Focused Vertical Stack */}
        <div className="max-w-2xl mb-8">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-2">
            Standar Fitofarmaka
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main tracking-tight mb-3">
            Komitmen Mutu &amp; <span className="italic font-normal text-dark-green">Kemurnian Alami</span>
          </h2>
          <p className="text-sm text-text-main/70 leading-relaxed">
            Setiap racikan formula Al-Kautsar diproses melalui standar CPOTB ketat untuk memastikan khasiat aktif tanaman terjaga utuh sampai ke tangan keluarga Anda.
          </p>
        </div>

        {/* Asymmetrical Bento Grid (1 Hero Tile 2-col + 2 Supporting Tiles 1-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Tile 1: The Fitofarmaka Cold Extraction Craft (Span 7 col) */}
          <div className="lg:col-span-7 bg-[#f6f2e9] rounded-2xl p-6 sm:p-8 md:p-10 border border-[#e8dfcf] flex flex-col justify-between shadow-2xs">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-full border border-[#ded4c0] text-xs font-bold text-dark-green mb-6 shadow-2xs">
                <Flask size={18} weight="duotone" className="text-primary-green" />
                <span>Teknologi Ekstraksi Dingin (Cold Extraction)</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-text-main mb-4 leading-snug">
                Menjaga Bioavailabilitas Senyawa Aktif Tanaman Tanpa Rusak Oleh Panas.
              </h3>

              <p className="text-sm text-text-main/75 leading-relaxed max-w-xl mb-8">
                Bahan rimpang seperti <span className="font-semibold text-text-main">kunyit, habbatussauda, dan daun sirsak</span> diekstrak pada suhu terkontrol untuk mengunci senyawa kurkuminoid dan flavonoid aktif agar cepat diserap oleh sistem metabolisme tubuh.
              </p>
            </div>

            {/* Micro-Features Checklist Strip */}
            <div className="pt-6 border-t border-[#dfd5c2] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-text-main">
              <div className="flex items-center gap-2">
                <CheckCircle size={17} weight="fill" className="text-primary-green shrink-0" />
                <span>Standar CPOTB Resmi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={17} weight="fill" className="text-primary-green shrink-0" />
                <span>Tanpa Endapan Ginjal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={17} weight="fill" className="text-primary-green shrink-0" />
                <span>Izin Edar BPOM RI</span>
              </div>
            </div>
          </div>

          {/* Right Column Stack (Span 5 col: 2 Vertical Tiles) */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-6">
            
            {/* Tile 2: Pure Metric Card (100% Purity) */}
            <div className="bg-[#f0f9f4] rounded-2xl p-6 sm:p-8 border border-[#cbe6d5] flex flex-col justify-between shadow-2xs">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-green-hover block mb-1">
                    Jaminan Keamanan Obat
                  </span>
                  <p className="font-serif text-4xl sm:text-5xl font-black text-dark-green tracking-tight">
                    100%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary-green shadow-xs border border-[#c0e0cc]">
                  <Plant size={28} weight="duotone" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-text-main mb-1.5">
                  Bahan Herbal Alami Murni (Nol BKO)
                </h4>
                <p className="text-xs text-text-main/70 leading-relaxed">
                  Bebas dari Bahan Kimia Obat sintetis, pewarna sintetis, maupun pemanis buatan. Aman dikonsumsi secara berkelanjutan.
                </p>
              </div>
            </div>

            {/* Tile 3: Trusted Logistics & Official Guarantee */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#eee9df] flex flex-col justify-between shadow-2xs">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#faf7f2] flex items-center justify-center text-accent-brown shadow-xs border border-[#ede7de]">
                  <Package size={28} weight="duotone" />
                </div>
                <div className="flex items-center gap-1.5 bg-[#e8f5e9] text-primary-green-hover text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck size={14} weight="bold" />
                  <span>Garansi Asli</span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-text-main mb-1.5">
                  Pengemasan Higienis &amp; Distribusi Terproteksi
                </h4>
                <p className="text-xs text-text-main/70 leading-relaxed mb-4">
                  Setiap kemasan dilengkapi segel anti-rusak ganda dan dikirim langsung dari gudang farmasi resmi dengan proteksi maksimal.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-dark-green hover:text-primary-green transition-colors group"
                >
                  <span>Konsultasi Formulasi Langsung</span>
                  <ArrowUpRight size={14} weight="bold" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
