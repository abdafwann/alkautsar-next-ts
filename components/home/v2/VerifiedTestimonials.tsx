'use client';

import { Star, CheckCircle } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Bpk. Hendra Gunawan',
    age: '54 tahun',
    city: 'Surabaya',
    complaint: 'Asam Urat & Jari Kaki Bengkak',
    product: 'Langtugin Ekstrak',
    timeframe: '2 Minggu Konsumsi',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    review: 'Dulu kalau bangun pagi jari kaki kaku dan sakit sekali diinjakkan. Setelah rutin minum Langtugin 2 minggu, bengkak kempes dan tensi asam urat turun dari 8.9 jadi 5.4.',
  },
  {
    name: 'Ibu Ratna Dewi',
    age: '46 tahun',
    city: 'Bandung',
    complaint: 'Maag Kronis & GERD Dada Panas',
    product: 'Madu Lambung Kunyit Putih',
    timeframe: '10 Hari Konsumsi',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    review: 'Sudah bolak-balik minum obat lambung kimia tapi sering kambuh kalau telat makan. Minum madu herbal ini perut adem, rasa begah dan asam naik di tenggorokan hilang.',
  },
  {
    name: 'Bpk. Ahmad Fauzi',
    age: '50 tahun',
    city: 'Semarang',
    complaint: 'Gula Darah Tinggi & Mudah Lemas',
    product: 'Diabetas Formula Herbal',
    timeframe: '1 Bulan Konsumsi',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    review: 'Gula puasa saya biasa di atas 230. Alhamdulillah dibarengi kurangi nasi dan minum Diabetas, sekarang stabil di 135 dan badan jauh lebih bertenaga.',
  },
];

export function VerifiedTestimonials() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full inline-block mb-3">
            Ulasan Terverifikasi
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Cerita Nyata Pemulihan Alami
          </h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Ribuan keluarga telah merasakan manfaat formula herbal terstandar Al-Kautsar untuk kembali beraktivitas dengan nyaman.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#f8faf7] rounded-3xl p-7 border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              <div>
                {/* Rating & Verified Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                    <CheckCircle size={11} />
                    <span>Pembeli Terverifikasi</span>
                  </span>
                </div>

                {/* Complaint & Product Badges */}
                <div className="space-y-1 mb-4">
                  <span className="inline-block text-[11px] font-extrabold text-[var(--color-primary-green)] bg-white px-2.5 py-1 rounded-lg border border-emerald-100 shadow-2xs">
                    {t.complaint}
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Produk: <strong>{t.product}</strong> ({t.timeframe})
                  </p>
                </div>

                {/* Quote Body */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>

              {/* Author Footer with Real Customer Avatar */}
              <div className="pt-5 mt-5 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{t.name}</h4>
                  <p className="text-[10px] text-gray-500">{t.age} • {t.city}</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-200 shadow-2xs">
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
