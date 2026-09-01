import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ketentuan Pengembalian | PT. AL-KAUTSAR',
  description: 'Syarat dan ketentuan pengembalian produk.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white min-h-[70vh]">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2000&auto=format&fit=crop" 
            alt="Customer Service Banner" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Ketentuan Pengembalian</h1>
          <p className="text-gray-200 text-sm md:text-base max-w-xl mx-auto">Panduan dan syarat untuk melakukan klaim pengembalian atau penukaran produk.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        
        <div className="text-base text-gray-600 leading-relaxed max-w-[65ch] space-y-8">
          <p className="text-xl text-gray-900 font-medium mb-12">
            Kepuasan Anda adalah prioritas kami. Jika Anda menerima produk dalam kondisi yang tidak sesuai, silakan baca ketentuan pengembalian di bawah ini.
          </p>
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Syarat Pengembalian</h2>
            <p className="mb-3">Pengembalian produk hanya dapat dilakukan dalam kondisi berikut:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Produk yang diterima rusak, cacat produksi, atau kemasan bocor.</li>
              <li>Produk yang diterima tidak sesuai dengan pesanan (salah kirim).</li>
              <li>Produk telah melewati masa kedaluwarsa (expired date) saat diterima.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Batas Waktu Klaim</h2>
            <p>
              Klaim pengembalian harus diajukan maksimal <strong className="text-gray-900">2x24 jam</strong> setelah status resi menunjukkan paket telah diterima. Klaim yang diajukan melewati batas waktu tersebut tidak akan diproses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Prosedur Pengembalian</h2>
            <ol className="list-decimal pl-5 space-y-3 mt-3">
              <li>Hubungi tim Customer Service kami melalui WhatsApp dengan menyertakan nomor pesanan.</li>
              <li>Lampirkan bukti berupa foto dan video <em className="italic">unboxing</em> saat paket pertama kali dibuka. Tanpa video unboxing, klaim tidak dapat kami terima.</li>
              <li>Setelah klaim disetujui, kami akan memberikan instruksi untuk mengembalikan produk ke gudang kami.</li>
              <li>Biaya pengiriman kembali ke gudang kami akan ditanggung oleh PT. AL-KAUTSAR jika kesalahan terbukti berada di pihak kami.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Proses Penggantian (Refund / Exchange)</h2>
            <p>
              Anda dapat memilih untuk menukar produk dengan barang yang sama atau meminta pengembalian dana (refund). Proses pengembalian dana membutuhkan waktu 3-5 hari kerja setelah barang retur kami terima dan kami periksa kondisinya.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
