export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex">
      {/* Background Pattern / Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1f422e] items-center justify-center overflow-hidden">
        {/* Abstract shapes / gradients for aesthetics */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00AA5B] to-[#1f422e] opacity-90" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#c3a052] blur-3xl opacity-20" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#00AA5B] blur-3xl opacity-30" />
        
        <div className="relative z-10 text-center px-12 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 mb-8">
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Kembali ke Alam, <br />
            Kembali Sehat
          </h1>
          <p className="text-lg text-[#f8fafc]/80 max-w-md mx-auto">
            Temukan berbagai produk herbal pilihan yang terbuat dari bahan-bahan alami terbaik untuk menjaga kesehatan Anda dan keluarga.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
          {children}
        </div>
      </div>
    </div>
  );
}
