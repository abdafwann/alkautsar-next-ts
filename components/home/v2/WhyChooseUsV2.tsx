'use client';

import { Leaf, ShieldCheck, Truck } from 'lucide-react';

const PILLARS = [
  {
    title: '100% Bahan Alami',
    description: 'Kami hanya menggunakan ekstrak tanaman dan herbal murni tanpa campuran bahan kimia sintetis yang berbahaya.',
    icon: Leaf,
  },
  {
    title: 'Teruji Klinis & Tersertifikasi',
    description: 'Seluruh produk kami melewati uji laboratorium ketat dan telah mendapatkan sertifikasi resmi dari otoritas kesehatan.',
    icon: ShieldCheck,
  },
  {
    title: 'Pengiriman Cepat & Aman',
    description: 'Pesanan Anda dikemas dengan sangat aman dan dikirim menggunakan layanan ekspedisi prioritas terpercaya.',
    icon: Truck,
  },
];

export default function WhyChooseUsV2() {
  return (
    <section className="py-20 md:py-28 bg-[#fdfbf7] border-y border-[#ede8de]/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-2">
            Komitmen Kualitas
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight mb-4">
            Mengapa Memilih Al-Kautsar
          </h2>
          <p className="text-sm text-text-main/70 leading-relaxed">
            Komitmen kami adalah memberikan yang terbaik dari alam, diproses dengan standar tertinggi untuk kesehatan Anda dan keluarga.
          </p>
        </div>

        {/* 3 Clean Grounded Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-[#eee9df] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-secondary-cream text-accent-brown flex items-center justify-center mb-6">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>

                  <h3 className="text-lg font-bold text-text-main mb-2.5">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-text-main/65 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#f2eee6] flex items-center gap-2 text-[11px] font-semibold text-primary-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-green" />
                  <span>Standar Terverifikasi</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
