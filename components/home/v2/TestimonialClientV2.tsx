'use client';

import { motion } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Siti Aminah',
    role: 'Pelanggan Setia',
    city: 'Bandung',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    content: 'Produk herbal dari Alkautsar sangat terasa khasiatnya. Badan terasa lebih segar dan tidak gampang capek. Pengirimannya juga sangat cepat dan rapi!',
    rating: 5,
    tag: 'Madu Herbal & Kebugaran',
  },
  {
    id: 2,
    name: 'Budi Santoso',
    role: 'Pembeli Terverifikasi',
    city: 'Surabaya',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'Awalnya ragu beli online, tapi packagingnya sangat aman berbubble wrap tebal. Kapsul ekstraknya murni tanpa bau menyengat, asam urat saya jauh membaik.',
    rating: 5,
    tag: 'Terapi Asam Urat',
  },
  {
    id: 3,
    name: 'Rina Marlina',
    role: 'Pelanggan Setia',
    city: 'Jakarta',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Sudah langganan di sini selama setahun untuk keluarga. Kualitasnya selalu konsisten premium, tidak pernah mengecewakan dan lambung selalu nyaman.',
    rating: 5,
    tag: 'Herbal Lambung & Maag',
  }
];

export default function TestimonialClientV2() {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full mb-3">
              Kisah Nyata Pelanggan
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Apa Kata <span className="text-[var(--color-primary-green)]">Keluarga Indonesia</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              Pengalaman nyata ribuan konsumen yang telah mempercayakan pemulihan kesehatan alaminya bersama Al-Kautsar.
            </p>
          </motion.div>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-[#f8faf7] rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Rating & Verified Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    <CheckCircle size={11} />
                    <span>Terverifikasi</span>
                  </span>
                </div>

                {/* Topic Badge */}
                <div className="mb-4">
                  <span className="inline-block text-[11px] font-extrabold text-[var(--color-primary-green)] bg-white px-2.5 py-1 rounded-lg border border-emerald-100 shadow-2xs">
                    {t.tag}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-6 mt-6 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">{t.name}</h4>
                  <p className="text-[11px] text-gray-500">{t.role} • {t.city}</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-200 shadow-2xs">
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
