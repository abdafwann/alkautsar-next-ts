import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | PT. AL-KAUTSAR',
  description: 'Bagaimana kami melindungi privasi dan data Anda.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-[70vh]">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2000&auto=format&fit=crop" 
            alt="Privacy Policy Banner" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Kebijakan Privasi</h1>
          <p className="text-gray-200 text-sm md:text-base max-w-xl mx-auto">Komitmen kami dalam melindungi data pribadi dan privasi Anda.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        
        <div className="text-base text-gray-600 leading-relaxed max-w-[65ch] space-y-8">
          <p className="text-xl text-gray-900 font-medium mb-12">
            Kami di PT. AL-KAUTSAR sangat menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
          </p>
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami dapat mengumpulkan informasi pribadi yang Anda berikan secara langsung, seperti nama, alamat pengiriman, nomor telepon, dan alamat email saat Anda mendaftar akun, melakukan transaksi, atau menghubungi layanan pelanggan kami.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Penggunaan Informasi</h2>
            <p className="mb-3">Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memproses dan mengirimkan pesanan Anda.</li>
              <li>Mengelola akun dan memberikan dukungan pelanggan.</li>
              <li>Mengirimkan pembaruan pesanan dan informasi logistik.</li>
              <li>Mengirimkan penawaran promosi atau buletin jika Anda telah berlangganan (Anda dapat berhenti berlangganan kapan saja).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Perlindungan Data</h2>
            <p>
              Kami mengimplementasikan standar keamanan teknis yang wajar untuk melindungi data Anda dari akses, perubahan, atau pengungkapan yang tidak sah. Transaksi pembayaran Anda diproses melalui gateway pembayaran aman yang mengenkripsi data finansial Anda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Berbagi Informasi Pihak Ketiga</h2>
            <p>
              Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi penting (seperti nama, alamat, dan nomor telepon) kepada mitra logistik kami semata-mata untuk keperluan pengiriman pesanan Anda.
            </p>
          </section>
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Perubahan Kebijakan</h2>
            <p>
              PT. AL-KAUTSAR berhak untuk memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan apa pun akan dipublikasikan di halaman ini. Kami menyarankan Anda untuk meninjau halaman ini secara berkala.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
