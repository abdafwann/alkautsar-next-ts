'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Apakah obat herbal Al-Kautsar aman diminum bersamaan dengan obat dokter?',
    a: 'Sangat aman, asalkan diberi jeda waktu 1 hingga 2 jam setelah atau sebelum mengonsumsi obat dokter. Hal ini bertujuan agar proses penyerapan nutrisi herbal dan obat medis tidak saling tumpang tindih.',
  },
  {
    q: 'Berapa lama rata-rata efek khasiat mulai terasa di tubuh?',
    a: 'Karena menggunakan formula ekstrak konsentrasi tinggi terstandar, sebagian besar pelanggan kami mulai merasakan perubahan positif dan kenyamanan tubuh dalam waktu 7 hingga 14 hari konsumsi rutin sesuai anjuran.',
  },
  {
    q: 'Bagaimana cara memastikan keaslian nomor BPOM produk?',
    a: 'Semua produk Al-Kautsar tercantum nomor izin edar resmi POM TR pada setiap kemasan box dan botol. Anda dapat mengecek keasliannya langsung di aplikasi BPOM Mobile atau website resmi cekbpom.pom.go.id.',
  },
  {
    q: 'Apakah bisa memesan dengan sistem Bayar di Tempat (COD)?',
    a: 'Bisa. Kami melayani pengiriman COD ke seluruh wilayah Indonesia. Anda cukup membayar kepada kurir saat paket produk herbal sampai dengan aman di depan rumah Anda.',
  },
  {
    q: 'Bagaimana cara berkonsultasi mengenai dosis khusus untuk lansia?',
    a: 'Anda dapat menghubungi layanan herbalis kami langsung melalui tombol WhatsApp. Tim herbalis kami akan memberikan panduan dosis bertahap dan pantangan makanan yang tepat sesuai riwayat kesehatan.',
  },
];

export function HerbalFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-16 md:py-24 bg-[#f8faf7] border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-green)] bg-emerald-50 px-3.5 py-1 rounded-full inline-block mb-3">
            Tanya Jawab Populer
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pertanyaan Seputar Konsumsi Herbal
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Informasi penting agar Anda merasa tenang dan yakin memulai langkah hidup sehat alami.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 mb-12">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-[var(--color-primary-green)] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--color-primary-green)]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-[var(--color-primary-green)] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold">Masih Memiliki Pertanyaan Lain?</h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-md">
              Jangan ragu untuk berdiskusi dengan tim herbalis resmi kami. Konsultasi bebas biaya.
            </p>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Herbalis%20Al-Kautsar,%20saya%20ingin%20konsultasi%20keluhan%20kesehatan%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-[var(--color-primary-green)] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <MessageCircle size={16} />
            <span>Chat Herbalis via WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
