'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MessageCircle, ArrowRight, RotateCcw, CheckCircle, ShieldCheck } from 'lucide-react';

interface QuizResult {
  title: string;
  recommendedHerbal: string;
  advice: string;
  dose: string;
  waMessage: string;
}

const QUIZ_DATA: Record<string, Record<string, QuizResult>> = {
  sendi: {
    ringan: {
      title: 'Pemulihan Nyeri Sendi Ringan / Baru Terasa',
      recommendedHerbal: 'Langtugin & Ekstrak Daun Salam',
      advice: 'Cukupi minum air putih 2L/hari, kurangi konsumsi jeroan & emping melinjo.',
      dose: '2 kapsul sehari sesudah makan.',
      waMessage: 'Halo Herbalis Al-Kautsar, saya baru merasakan nyeri sendi/pegal, ingin tanya tentang Langtugin.',
    },
    sedang: {
      title: 'Perawatan Asam Urat & Sendi Kaku',
      recommendedHerbal: 'Samuratik Forte & Langtugin Ekstrak',
      advice: 'Fokus menurunkan kadar purin darah dan melancarkan sirkulasi cairan sendi.',
      dose: '3 × 2 kapsul sehari sesudah makan.',
      waMessage: 'Halo Herbalis Al-Kautsar, saya sudah 1-3 bulan asam urat sering kambuh, mohon panduan konsumsi herbalnya.',
    },
    menahun: {
      title: 'Terapi Intensif Asam Urat & Sendi Menahun',
      recommendedHerbal: 'Paket Terapi Sendi Lengkap (Samuratik + Minyak Herbal Balur)',
      advice: 'Kombinasi terapi minum untuk perbaikan dari dalam dan balur untuk redakan bengkak lokal.',
      dose: 'Terapi rutin selama 30 hari + pendampingan herbalis.',
      waMessage: 'Halo Herbalis Al-Kautsar, asam urat saya sudah menahun dan sering bengkak, saya ingin konsultasi terapi intensif.',
    },
  },
  lambung: {
    ringan: {
      title: 'Pereda Kembung & Perih Lambung',
      recommendedHerbal: 'Madu Lambung Kunyit Putih',
      advice: 'Hindari makanan terlalu pedas/asam, makan teratur porsi kecil tapi sering.',
      dose: '2 sendok makan sebelum makan.',
      waMessage: 'Halo Herbalis Al-Kautsar, perut saya sering kembung dan perih, ingin tanya madu lambung.',
    },
    sedang: {
      title: 'Pemulihan Maag Kronis & GERD',
      recommendedHerbal: 'Ekstrak Temulawak & Madu Lambung Spesial',
      advice: 'Membantu melapisi mukosa lambung yang meradang dan redakan gas lambung naik ke dada.',
      dose: '3 × 1 sendok makan rutin sebelum makan.',
      waMessage: 'Halo Herbalis Al-Kautsar, saya mengalami asam lambung/GERD sudah beberapa bulan, mohon saran herbalnya.',
    },
    menahun: {
      title: 'Perawatan Komprehensif Saluran Cerna Menahun',
      recommendedHerbal: 'Paket Sehat Lambung Total (Herba Maag + Probiotik Alami)',
      advice: 'Menetralkan asam lambung berlebih dan meregenerasi sel dinding lambung secara total.',
      dose: 'Konsumsi rutin pagi dan malam.',
      waMessage: 'Halo Herbalis Al-Kautsar, asam lambung saya sering kambuh menahun, ingin konsultasi dosis herbal yang tepat.',
    },
  },
  diabetes: {
    ringan: {
      title: 'Stabilisasi Gula Darah Harian',
      recommendedHerbal: 'Ekstrak Daun Sukun & Mahoni',
      advice: 'Kurangi konsumsi gula sederhana dan nasi putih berlebih, perbanyak jalan kaki.',
      dose: '2 kapsul sehari sesudah makan.',
      waMessage: 'Halo Herbalis Al-Kautsar, saya ingin menjaga agar gula darah tetap stabil secara alami.',
    },
    sedang: {
      title: 'Penurun Gula Darah & Perbaikan Pankreas',
      recommendedHerbal: 'Diabetas Herbal Formula Terstandar',
      advice: 'Membantu regenerasi sel beta pankreas untuk sekresi insulin alami yang optimal.',
      dose: '3 × 2 kapsul sehari 30 menit sebelum makan.',
      waMessage: 'Halo Herbalis Al-Kautsar, gula darah saya sering tinggi di atas 200, ingin tahu aturan minum Diabetas.',
    },
    menahun: {
      title: 'Terapi Menyeluruh Diabetes & Pencegahan Komplikasi',
      recommendedHerbal: 'Paket Diabetas Complete + Habbatussauda Softgel',
      advice: 'Cegah komplikasi ke ginjal, mata, dan pembuluh darah perifer dengan antioksidan tinggi.',
      dose: 'Terapi bertahap dengan evaluasi berkala.',
      waMessage: 'Halo Herbalis Al-Kautsar, saya menderita diabetes cukup lama, ingin konsultasi herbal pendamping yang aman untuk ginjal.',
    },
  },
};

export function HerbalQuizMatcher() {
  const [complaint, setComplaint] = useState<'sendi' | 'lambung' | 'diabetes'>('sendi');
  const [duration, setDuration] = useState<'ringan' | 'sedang' | 'menahun'>('sedang');
  const [showResult, setShowResult] = useState(false);

  const result = QUIZ_DATA[complaint]?.[duration] || QUIZ_DATA.sendi.sedang;

  return (
    <section className="py-16 md:py-24 bg-[#f8faf7] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[var(--color-primary-green)] text-xs font-bold mb-3">
            <Sparkles size={13} />
            <span>Tes Cepat 30 Detik</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Temukan Herbal yang Tepat untuk Tubuh Anda
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Jawab 2 pertanyaan singkat ini untuk mendapatkan panduan herbal terstandar beserta anjuran herbalis.
          </p>
        </div>

        {/* Interactive Matcher Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-gray-100">
          
          {!showResult ? (
            <div className="space-y-8">
              
              {/* Question 1: Health Complaint */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-3">
                  1. Pilih Keluhan Utama yang Ingin Disembuhkan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setComplaint('sendi')}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                      complaint === 'sendi'
                        ? 'border-[var(--color-primary-green)] bg-emerald-50 text-[var(--color-primary-green)] font-bold shadow-2xs ring-1 ring-[var(--color-primary-green)]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <span className="text-2xl">🦴</span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">Asam Urat & Sendi</p>
                      <p className="text-[11px] text-gray-500 font-normal">Nyeri, pegal, bengkak</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComplaint('lambung')}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                      complaint === 'lambung'
                        ? 'border-[var(--color-primary-green)] bg-emerald-50 text-[var(--color-primary-green)] font-bold shadow-2xs ring-1 ring-[var(--color-primary-green)]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <span className="text-2xl">🌿</span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">Lambung & GERD</p>
                      <p className="text-[11px] text-gray-500 font-normal">Perih, mual, dada begah</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComplaint('diabetes')}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                      complaint === 'diabetes'
                        ? 'border-[var(--color-primary-green)] bg-emerald-50 text-[var(--color-primary-green)] font-bold shadow-2xs ring-1 ring-[var(--color-primary-green)]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <span className="text-2xl">🩸</span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">Gula Darah & Diabetes</p>
                      <p className="text-[11px] text-gray-500 font-normal">Gula tinggi, mudah lelah</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Question 2: Duration */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-3">
                  2. Sudah Berapa Lama Keluhan Ini Dirasakan?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuration('ringan')}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      duration === 'ringan'
                        ? 'border-[var(--color-primary-green)] bg-emerald-50 text-[var(--color-primary-green)] font-bold shadow-2xs ring-1 ring-[var(--color-primary-green)]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">Baru Terasa</p>
                    <p className="text-[11px] text-gray-500 font-normal">&lt; 2 minggu terakhir</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuration('sedang')}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      duration === 'sedang'
                        ? 'border-[var(--color-primary-green)] bg-emerald-50 text-[var(--color-primary-green)] font-bold shadow-2xs ring-1 ring-[var(--color-primary-green)]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">1 - 3 Bulan</p>
                    <p className="text-[11px] text-gray-500 font-normal">Sering kambuh hilang timbul</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuration('menahun')}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      duration === 'menahun'
                        ? 'border-[var(--color-primary-green)] bg-emerald-50 text-[var(--color-primary-green)] font-bold shadow-2xs ring-1 ring-[var(--color-primary-green)]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold">Menahun (&gt; 6 Bulan)</p>
                    <p className="text-[11px] text-gray-500 font-normal">Sudah coba berbagai obat</p>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowResult(true)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-primary-green)] hover:bg-[var(--color-primary-green-hover)] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lihat Rekomendasi Herbal Saya</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          ) : (
            /* Result Screen */
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-[var(--color-primary-green)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)]">
                    Hasil Rekomendasi Khusus Anda
                  </span>
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Ulangi Tes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Result Details */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                    {result.title}
                  </h3>

                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-900 mb-1">Rekomendasi Formula Herbal:</p>
                    <p className="text-sm font-extrabold text-[var(--color-primary-green)]">
                      {result.recommendedHerbal}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600">
                    <p><strong>💡 Anjuran Pola Hidup:</strong> {result.advice}</p>
                    <p><strong>⏰ Anjuran Konsumsi:</strong> {result.dose}</p>
                  </div>
                </div>

                {/* Direct Action Box */}
                <div className="md:col-span-5 bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <ShieldCheck size={16} className="text-[var(--color-primary-green)]" />
                    <span>Konsultasi Herbalis Berpengalaman</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Setiap tubuh memiliki respon unik. Konsultasikan langsung via WhatsApp agar dosis dan aturan minum disesuaikan dengan kondisi Anda.
                  </p>

                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(result.waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[var(--color-primary-green)] hover:bg-[var(--color-primary-green-hover)] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <MessageCircle size={15} />
                    <span>Konsultasi ke Herbalis Sekarang</span>
                  </a>

                  <Link
                    href="/shop"
                    className="w-full py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl text-center transition-colors border border-gray-200"
                  >
                    Lihat Katalog Produk Lengkap
                  </Link>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
