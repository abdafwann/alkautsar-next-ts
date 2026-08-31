'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MessageCircle, ArrowRight, ShieldCheck, CheckCircle, Info } from 'lucide-react';

interface GuideItem {
  id: string;
  category: string;
  symptoms: string;
  productName: string;
  dose: string;
  dietAdvice: string;
  photoUrl: string;
  waText: string;
}

const GUIDES: GuideItem[] = [
  {
    id: 'sendi',
    category: 'Asam Urat & Nyeri Sendi',
    symptoms: 'Nyeri berdenyut pada jempol kaki/lutut, kaku sendi pagi hari, rasa panas bengkak.',
    productName: 'Langtugin Ekstrak & Samuratik Forte',
    dose: '2 × 2 kapsul sehari setelah makan.',
    dietAdvice: 'Batasi emping, jeroan, kacang berlebih. Cukupi minum air putih minimal 2 liter per hari.',
    photoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    waText: 'Halo Herbalis Al-Kautsar, saya ingin konsultasi mengenai penanganan Asam Urat & Nyeri Sendi.',
  },
  {
    id: 'lambung',
    category: 'Maag Kronis & Asam Lambung (GERD)',
    symptoms: 'Perut perih melilit, dada panas begah (heartburn), mual saat telat makan.',
    productName: 'Madu Lambung Kunyit Putih Spesial',
    dose: '2 × 1 sendok makan 30 menit sebelum makan.',
    dietAdvice: 'Hindari makanan terlalu asam, pedas menyengat, serta makan teratur porsi kecil tapi sering.',
    photoUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop&q=80',
    waText: 'Halo Herbalis Al-Kautsar, saya ingin konsultasi mengenai herbal Maag & Asam Lambung.',
  },
  {
    id: 'diabetes',
    category: 'Gula Darah & Kebugaran Pankreas',
    symptoms: 'Cepat haus dan lapar berlebih, sering buang air kecil malam hari, luka lambat kering.',
    productName: 'Diabetas Herbal Ekstrak Terstandar',
    dose: '3 × 2 kapsul sehari sebelum makan.',
    dietAdvice: 'Ganti nasi putih dengan karbohidrat kompleks (beras merah/umbi) dan rutin jalan kaki 20 menit.',
    photoUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    waText: 'Halo Herbalis Al-Kautsar, saya ingin konsultasi mengenai herbal untuk kestabilan Gula Darah.',
  },
];

export function HerbalSolutionGuide() {
  const [activeTab, setActiveTab] = useState<string>(GUIDES[0].id);
  const activeGuide = GUIDES.find((g) => g.id === activeTab) || GUIDES[0];

  return (
    <section className="py-16 md:py-24 bg-[#f8faf7] border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full inline-block mb-3">
            Panduan Edukasi Terstruktur
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Panduan Rekomendasi Herbal Sesuai Kebutuhan Tubuh
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Pahami gejala yang Anda rasakan dan temukan formula herbal terstandar serta pola konsumsi yang tepat.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {GUIDES.map((g) => {
            const isActive = g.id === activeTab;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveTab(g.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary-green)] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
                }`}
              >
                {g.category}
              </button>
            );
          })}
        </div>

        {/* Main Solution Visual Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Visual Photo */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden h-72 lg:h-80 shadow-md">
              <img
                src={activeGuide.photoUrl}
                alt={activeGuide.category}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                <span className="text-xs font-bold text-white bg-black/40 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/20">
                  {activeGuide.category}
                </span>
              </div>
            </div>

            {/* Right Column: Guidance & Actions */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gejala Umum:</span>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{activeGuide.symptoms}</p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Formula Herbal Anjuran:</span>
                <p className="text-sm sm:text-base font-extrabold text-[var(--color-primary-green)] mt-0.5">
                  {activeGuide.productName}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Aturan Minum:</strong> {activeGuide.dose}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Saran Pola Makan & Kebiasaan:</span>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 leading-relaxed">{activeGuide.dietAdvice}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(activeGuide.waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-[var(--color-primary-green)] hover:bg-[var(--color-primary-green-hover)] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>Konsultasi Herbalis Langsung</span>
                </a>

                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors text-center"
                >
                  Lihat di Katalog Produk
                </Link>
              </div>

            </div>

          </div>

          {/* Ethical Medical Disclaimer */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-start gap-2.5 text-[11px] text-gray-500">
            <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Catatan Medis:</strong> Rekomendasi di atas merupakan panduan edukasi produk herbal dan bukan pengganti diagnosis medis resmi oleh dokter atau rumah sakit.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
