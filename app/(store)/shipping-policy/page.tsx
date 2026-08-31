import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Pengiriman | PT. AL-KAUTSAR',
  description: 'Informasi mengenai kebijakan pengiriman pesanan Anda.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white min-h-[70vh]">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=2000&auto=format&fit=crop" 
            alt="Herbal Medicine Banner" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Kebijakan Pengiriman</h1>
          <p className="text-gray-200 text-sm md:text-base max-w-xl mx-auto">Informasi lengkap mengenai proses dan estimasi waktu pengiriman pesanan Anda.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        
        <div className="text-base text-gray-600 leading-relaxed max-w-[65ch] space-y-8">
          <p className="text-xl text-gray-900 font-medium mb-12">
            Kami berkomitmen untuk mengantarkan pesanan produk herbal Anda dengan cepat dan aman ke seluruh wilayah Indonesia.
          </p>
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Waktu Proses Pesanan</h2>
            <p>
              Semua pesanan yang masuk sebelum pukul 15.00 WIB pada hari kerja (Senin - Jumat) akan diproses pada hari yang sama. Pesanan yang masuk setelah waktu tersebut, atau pada akhir pekan dan hari libur nasional, akan diproses pada hari kerja berikutnya.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Metode dan Biaya Pengiriman</h2>
            <p>
              Biaya pengiriman dihitung otomatis pada saat checkout berdasarkan berat total produk dan alamat tujuan pengiriman. Kami bekerja sama dengan mitra logistik terpercaya (JNE, SiCepat, J&T, dan GoSend/GrabExpress untuk area tertentu) untuk memastikan produk Anda tiba tepat waktu.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Estimasi Waktu Pengiriman</h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong className="text-gray-900">Jabodetabek:</strong> 1-2 hari kerja.</li>
              <li><strong className="text-gray-900">Pulau Jawa:</strong> 2-4 hari kerja.</li>
              <li><strong className="text-gray-900">Luar Pulau Jawa:</strong> 3-7 hari kerja tergantung lokasi spesifik.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Pelacakan Pesanan</h2>
            <p>
              Setelah pesanan Anda dikirim, Anda akan menerima email konfirmasi yang berisi nomor resi pengiriman. Anda dapat melacak status pengiriman melalui situs web mitra logistik kami atau melalui halaman akun Anda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Kendala Pengiriman</h2>
            <p>
              Jika terjadi keterlambatan atau masalah dengan pengiriman Anda, silakan hubungi layanan pelanggan kami melalui WhatsApp atau email yang tertera di halaman kontak. Kami akan dengan senang hati membantu menelusuri pesanan Anda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
