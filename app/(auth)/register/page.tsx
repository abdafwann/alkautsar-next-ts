'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { registerUser } from '@/app/actions/userAuth';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      const err = 'Kata sandi dan konfirmasi kata sandi tidak cocok.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (password.length < 6) {
      const err = 'Kata sandi minimal 6 karakter.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setIsLoading(true);
    const res = await registerUser(formData);

    if (res.success) {
      toast.success('Pendaftaran berhasil! Mengalihkan ke halaman masuk...');
      router.push('/login');
    } else {
      if (res.reason === 'EXISTS') {
        const err = 'Email ini sudah terdaftar. Mengalihkan ke halaman masuk...';
        setErrorMessage(err);
        toast.error(err);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const err = res.error || 'Gagal mendaftar. Silakan periksa kembali data Anda.';
        setErrorMessage(err);
        toast.error(err);
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-emerald-950/[0.03] border border-gray-100/80 transition-all">
      
      {/* Direct Clean Header */}
      <div className="mb-6 text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Buat Akun Baru
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
          Lengkapi data berikut untuk mendaftar akun pelanggan.
        </p>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-300">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
          <span className="leading-relaxed font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleRegister} className="space-y-3.5">
        
        {/* Name Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Nama Lengkap
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              <User size={16} />
            </div>
            <input
              type="text"
              name="name"
              required
              placeholder="Masukkan nama lengkap"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00AA5B] focus:ring-3 focus:ring-[#00AA5B]/15 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Alamat Email
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              <Mail size={16} />
            </div>
            <input
              type="email"
              name="email"
              required
              placeholder="nama@email.com"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00AA5B] focus:ring-3 focus:ring-[#00AA5B]/15 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Kata Sandi
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="Minimal 6 karakter"
              className="w-full pl-10 pr-11 py-2.5 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00AA5B] focus:ring-3 focus:ring-[#00AA5B]/15 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium transition-all duration-200 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              <Lock size={16} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              required
              placeholder="Ketik ulang kata sandi"
              className="w-full pl-10 pr-11 py-2.5 bg-gray-50/60 hover:bg-gray-50 focus:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#00AA5B] focus:ring-3 focus:ring-[#00AA5B]/15 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 font-medium transition-all duration-200 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#00AA5B] hover:bg-[#00914d] active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-[#00AA5B]/20 hover:shadow-lg hover:shadow-[#00AA5B]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          Sudah memiliki akun Al-Kautsar?{' '}
          <Link 
            href="/login" 
            className="text-[#00AA5B] font-bold hover:underline transition-all inline-flex items-center gap-1"
          >
            <span>Masuk di sini</span>
            <ArrowRight size={13} />
          </Link>
        </p>
      </div>

    </div>
  );
}
