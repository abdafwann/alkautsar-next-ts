'use client';

import { Leaf, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyChooseUsClient() {


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="bg-white rounded-[40px] p-8 md:p-16 lg:p-20 text-text-main relative overflow-hidden shadow-xl border border-zinc-100">
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Title Section (Left side on desktop) */}
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-6 text-text-main leading-tight">
                Mengapa Memilih <br/><span className="text-primary-green">Al-Kautsar</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                Komitmen kami adalah memberikan yang terbaik dari alam, diproses dengan standar tertinggi untuk kesehatan Anda dan keluarga.
              </p>
            </motion.div>

            {/* Features Section (Right side on desktop - Asymmetric stack) */}
            <motion.div 
              className="lg:col-span-7 flex flex-col gap-6"
              variants={containerVariants}
              initial="visible"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {/* Feature 1 - Offset slightly right */}
              <motion.div variants={itemVariants} className="bg-[#fdfcf9] border border-[#eee9df] rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 ml-0 lg:ml-12 hover:bg-white hover:border-[#ded6c7] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-secondary-cream flex items-center justify-center text-accent-brown shrink-0 group-hover:scale-110 group-hover:bg-primary-green group-hover:text-white transition-all duration-300">
                  <Leaf className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-text-main">100% Bahan Alami</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Kami hanya menggunakan ekstrak tanaman dan herbal murni tanpa campuran bahan kimia sintetis yang berbahaya.</p>
                </div>
              </motion.div>

              {/* Feature 2 - Offset slightly left */}
              <motion.div variants={itemVariants} className="bg-[#fdfcf9] border border-[#eee9df] rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 mr-0 lg:mr-8 hover:bg-white hover:border-[#ded6c7] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-secondary-cream flex items-center justify-center text-accent-brown shrink-0 group-hover:scale-110 group-hover:bg-primary-green group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-text-main">Teruji Klinis & Tersertifikasi</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Seluruh produk kami melewati uji laboratorium ketat dan telah mendapatkan sertifikasi resmi dari otoritas kesehatan.</p>
                </div>
              </motion.div>

              {/* Feature 3 - Offset further right */}
              <motion.div variants={itemVariants} className="bg-[#fdfcf9] border border-[#eee9df] rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 ml-0 lg:ml-20 hover:bg-white hover:border-[#ded6c7] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-secondary-cream flex items-center justify-center text-accent-brown shrink-0 group-hover:scale-110 group-hover:bg-primary-green group-hover:text-white transition-all duration-300">
                  <Truck className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-text-main">Pengiriman Cepat & Aman</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Pesanan Anda dikemas dengan sangat aman dan dikirim menggunakan layanan ekspedisi prioritas terpercaya.</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
