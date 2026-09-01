'use client';

import { Leaf, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

const CRAFT_STORIES = [
  {
    step: '01',
    title: 'Bahan Baku Segar Pilihan',
    description: 'Dipanen langsung dari kebun herbal binaan di tanah vulkanis subur nusantara pada usia panen optimal.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    tag: '100% Alami & Organik',
    icon: Leaf,
  },
  {
    step: '02',
    title: 'Ekstraksi Suhu Rendah Modern',
    description: 'Menggunakan teknologi ekstraksi presisi tanpa merusak enzim aktif dan senyawa fitofarmaka alami.',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    tag: 'Standar CPOTB Farmasi',
    icon: Award,
  },
  {
    step: '03',
    title: 'Uji Sterilitas & Izin BPOM RI',
    description: 'Setiap bets produksi wajib lolos uji mikrobiologi, bebas logam berat, dan terdaftar resmi di BPOM.',
    imageUrl: 'https://images.unsplash.com/photo-1579165466791-788226ab77b6?w=800&auto=format&fit=crop&q=80',
    tag: 'Terverifikasi Bebas BKO',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Pendampingan Konsumen Terpadu',
    description: 'Konsultasi gratis panduan dosis dan pola makan bersama herbalis Al-Kautsar hingga keluhan pulih.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    tag: 'Layanan Responsif 24/7',
    icon: HeartHandshake,
  },
];

export function HerbalCraftVisualStory() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full inline-block mb-3">
            Standar Kualitas Al-Kautsar
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Dari Kebun Alam Nusantara Hingga ke Tangan Anda
          </h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Dedikasi penuh menjaga kemurnian herbal tanpa kompromi kualitas dan keamanan bagi keluarga Indonesia.
          </p>
        </div>

        {/* 4-Card Visual Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CRAFT_STORIES.map((story) => {
            const Icon = story.icon;
            return (
              <div
                key={story.step}
                className="group relative bg-[#f8faf7] rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Photo Header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Step Number Badge */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-extrabold text-gray-900 px-2.5 py-1 rounded-lg shadow-2xs">
                    Langkah {story.step}
                  </span>

                  {/* Feature Tag */}
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20">
                    {story.tag}
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[var(--color-primary-green)] flex items-center justify-center mb-3">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 leading-snug mb-2 group-hover:text-[var(--color-primary-green)] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {story.description}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
