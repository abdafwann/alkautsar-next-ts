'use client';

import { useState } from 'react';
import { InputPassword } from '@/components/ui/InputPassword';
import { Button } from '@/components/ui/Button';
import { changePassword } from '@/app/actions/account';
import { toast } from 'react-hot-toast';

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
    const pass = formData.get('newPassword') as string;
    const confirm = formData.get('confirmPassword') as string;

    if (pass !== confirm) {
      toast.error('Kata sandi baru tidak cocok.');
      return;
    }

    if (strength < 3) {
      toast.error('Kata sandi terlalu lemah. Harap periksa syarat minimum.');
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ganti Kata Sandi</h2>
        <p className="text-sm text-gray-500 mt-1">Pastikan kata sandi baru Anda kuat dan belum pernah digunakan sebelumnya.</p>
      </div>

      <div className="h-px w-full bg-zinc-100" />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <InputPassword
          label="Kata Sandi Saat Ini"
          name="oldPassword"
          placeholder="Masukkan kata sandi lama Anda"
          required
          className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
        />

        <div className="space-y-2">
          <InputPassword
            label="Kata Sandi Baru"
            name="newPassword"
            placeholder="Buat kata sandi baru"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
          />
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex gap-1.5 px-1 mb-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level} 
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      strength >= level 
                        ? strength <= 2 ? 'bg-red-500' : strength === 3 ? 'bg-amber-400' : 'bg-primary-green' 
                        : 'bg-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] px-1 font-medium ${strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-amber-500' : 'text-primary-green'}`}>
                {strength <= 1 && 'Sangat Lemah (Butuh 8 karakter, huruf besar & angka)'}
                {strength === 2 && 'Lemah (Tambahkan huruf besar atau angka)'}
                {strength === 3 && 'Kuat (Tambahkan simbol untuk lebih aman)'}
                {strength === 4 && 'Sangat Kuat'}
              </p>
            </div>
          )}
        </div>

        <InputPassword
          label="Konfirmasi Kata Sandi Baru"
          name="confirmPassword"
          placeholder="Ketik ulang kata sandi baru"
          required
          className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
        />

        <div className="pt-2">
          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full h-12 rounded-full bg-primary-green hover:bg-primary-green-hover"
          >
            Simpan Kata Sandi
          </Button>
        </div>
      </form>
    </div>
  );
}
