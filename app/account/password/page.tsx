'use client';

import { useState } from 'react';
import { InputPassword } from '@/components/ui/InputPassword';
import { Button } from '@/components/ui/Button';
import { changePassword } from '@/app/actions/account';
import { toast } from 'react-hot-toast';
import { LockKey, ShieldCheck, Check } from '@phosphor-icons/react';

export default function PasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const pass = (formData.get('newPassword') as string)?.trim();
    const confirm = (formData.get('confirmPassword') as string)?.trim();

    if (!pass || !confirm) {
      toast.error('Harap lengkapi semua kolom kata sandi.');
      return;
    }

    if (pass !== confirm) {
      toast.error('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (strength < 3) {
      toast.error('Kata sandi terlalu lemah. Harap periksa syarat minimum keamanan.');
      return;
    }

    setIsLoading(true);
    const res = await changePassword(formData);

    if (res.success) {
      toast.success('Kata sandi berhasil diubah!');
      e.currentTarget.reset();
      setNewPassword('');
    } else {
      toast.error(res.error || 'Gagal mengubah kata sandi');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-[#ede8de]">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-1">
          Keamanan Akun
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight">
          Ganti Kata Sandi
        </h2>
        <p className="text-xs text-text-main/70 mt-1 leading-relaxed">
          Gunakan kombinasi minimal 8 karakter dengan huruf besar, angka, dan simbol untuk melindungi akun Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div>
          <label className="block text-xs font-bold text-text-main mb-1.5">
            Kata Sandi Saat Ini <span className="text-rose-500">*</span>
          </label>
          <InputPassword
            name="oldPassword"
            placeholder="Masukkan kata sandi lama Anda"
            required
            className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-text-main mb-1.5">
            Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <InputPassword
            name="newPassword"
            placeholder="Buat kata sandi baru yang kuat"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
          />
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 pt-1">
              <div className="flex gap-1.5 mb-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      strength >= level 
                        ? strength <= 2 ? 'bg-rose-500' : strength === 3 ? 'bg-amber-400' : 'bg-primary-green' 
                        : 'bg-[#ede8de]'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] font-semibold ${strength <= 2 ? 'text-rose-600' : strength === 3 ? 'text-amber-600' : 'text-primary-green'}`}>
                {strength <= 1 && 'Sangat Lemah (Minimal 8 karakter, huruf besar & angka)'}
                {strength === 2 && 'Cukup (Tambahkan variasi angka atau huruf besar)'}
                {strength === 3 && 'Kuat (Bagus! Tambahkan simbol untuk keamanan ekstra)'}
                {strength === 4 && 'Sangat Kuat & Aman'}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-text-main mb-1.5">
            Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <InputPassword
            name="confirmPassword"
            placeholder="Ketik ulang kata sandi baru"
            required
            className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full h-10 rounded-xl bg-dark-green hover:bg-primary-green text-white font-bold text-xs transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <LockKey size={16} weight="bold" />
            <span>Perbarui Kata Sandi</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
