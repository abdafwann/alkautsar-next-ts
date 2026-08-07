'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InputPassword } from '@/components/ui/InputPassword';
import { registerUser } from '@/app/actions/userAuth';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast.error('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    const res = await registerUser(formData);

    if (res.success) {
      toast.success('Pendaftaran berhasil! Silakan login.');
      router.push('/login');
    } else {
      if (res.reason === 'EXISTS') {
        toast.error('Email sudah terdaftar. Mengalihkan ke halaman login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(res.error || 'Gagal mendaftar. Silakan coba lagi.');
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru ✨</h2>
        <p className="text-gray-500 text-sm">Bergabunglah dengan kami dan nikmati berbagai penawaran menarik produk herbal alami.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input 
          label="Nama Lengkap" 
          name="name" 
          type="text" 
          placeholder="Masukkan nama lengkap Anda" 
          required 
        />
        
        <Input 
          label="Email" 
          name="email" 
          type="email" 
          placeholder="contoh@email.com" 
          required 
        />
        
        <InputPassword 
          label="Kata Sandi" 
          name="password" 
          placeholder="Buat kata sandi yang kuat" 
          required 
        />

        <InputPassword 
          label="Konfirmasi Kata Sandi" 
          name="confirmPassword" 
          placeholder="Ketik ulang kata sandi Anda" 
          required 
        />

        <Button 
          type="submit" 
          className="w-full h-12 text-base mt-4" 
          isLoading={isLoading}
        >
          Daftar Sekarang
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary-green font-semibold hover:underline">
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
