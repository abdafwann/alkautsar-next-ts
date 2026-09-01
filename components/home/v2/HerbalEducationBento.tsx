'use client';

import { ShieldCheck, Leaf, FlaskConical, Stethoscope, Award, CheckCircle } from 'lucide-react';

export function HerbalEducationBento() {
  return (
    <section className="py-16 md:py-24 bg-[#fbfdfc] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full inline-block mb-3">
            Edukasi & Jaminan Mutu
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Mengapa Memilih Herbal Terstandar Al-Kautsar?
          </h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Memilih obat herbal tidak boleh sembarangan. Kami memastikan setiap kapsul memberi manfaat nyata tanpa membahayakan organ tubuh.
          </p>
        </div>

        {/* Bento Grid: 3 Distinct Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento Tile 1 */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--color-primary-green)] flex items-center justify-center mb-5">
                <FlaskConical size={24} />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pilar 01</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-3">
                Ekstrak Konsentrasi Tinggi, Bukan Jamu Kasar
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Kami mengekstraksi hanya senyawa aktif berkhasiat. Tidak mengandung ampas kasar yang memberatkan fungsi ginjal dan lebih cepat diserap tubuh.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-50 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle size={15} className="text-[var(--color-primary-green)]" />
              <span>Bioavailabilitas 3× Lebih Optimal</span>
            </div>
          </div>

          {/* Bento Tile 2 */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--color-primary-green)] flex items-center justify-center mb-5">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pilar 02</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-3">
                100% Bebas Bahan Kimia Obat (BKO)
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Teruji laboratorium bebas campuran obat kimia sintesis berbahaya seperti parasetamol atau dexamethasone. Murni mengandalkan kebaikan fitofarmaka alami.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-50 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle size={15} className="text-[var(--color-primary-green)]" />
              <span>Izin Edar Resmi BPOM RI</span>
            </div>
          </div>

          {/* Bento Tile 3 */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--color-primary-green)] flex items-center justify-center mb-5">
                <Stethoscope size={24} />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pilar 03</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-3">
                Pendampingan Herbalis Hingga Kondisi Membaik
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Anda tidak berjuang sendiri. Dapatkan konsultasi gratis mengenai pantangan makanan, aturan dosis bertahap, dan panduan pola hidup sehat setiap hari.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-50 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle size={15} className="text-[var(--color-primary-green)]" />
              <span>Layanan Konsultasi WhatsApp 24/7</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
