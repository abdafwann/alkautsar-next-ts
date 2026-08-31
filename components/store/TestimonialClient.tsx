'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Siti Aminah',
    role: 'Pelanggan Setia',
    content: 'Produk herbal dari Alkautsar sangat terasa khasiatnya. Badan terasa lebih segar dan tidak gampang capek. Pengirimannya juga sangat cepat!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Budi Santoso',
    role: 'Pembeli Baru',
    content: 'Awalnya ragu beli online, tapi packagingnya sangat rapi dan aman. Teh herbalnya enak, rasanya murni tanpa campuran.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Rina Marlina',
    role: 'Pelanggan Setia',
    content: 'Sudah langganan madu herbal di sini selama setahun. Kualitasnya selalu konsisten premium, tidak pernah mengecewakan keluarga saya.',
    rating: 5,
  }
];

export default function TestimonialClient() {


  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary-cream to-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-accent-brown font-bold tracking-widest uppercase text-xs mb-3">
              Kisah Mereka
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-text-main tracking-tight">
              Apa Kata <span className="text-primary-green">Pelanggan Kami</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-white rounded-[24px] p-8 shadow-xl shadow-primary-green/5 relative group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute top-6 right-8 text-secondary-green/30 group-hover:text-accent-brown/20 transition-colors">
                <Quote size={48} />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-accent-brown text-accent-brown" />
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-8 relative z-10">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-green/20 flex items-center justify-center text-primary-green font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-text-main">{testimonial.name}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
