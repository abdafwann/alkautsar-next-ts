'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InputPassword } from '@/components/ui/InputPassword';
import { loginUser } from '@/app/actions/userAuth';
import { mergeGuestCart } from '@/app/actions/cart';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await loginUser(formData);

    if (res.success) {
      // Merge guest cart to DB (Navbar will fetch fresh DB cart on next mount)
      const guestItems = useCartStore.getState().items;
      await mergeGuestCart(guestItems);

      toast.success('Berhasil login! Selamat datang kembali.');
      window.location.href = '/';
    } else {
      toast.error(res.error || 'Gagal login. Silakan coba lagi.');
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang Kembali! 👋</h2>
        <p className="text-gray-500 text-sm">Masuk untuk melanjutkan belanja produk herbal favoritmu.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="contoh@email.com"
          required
        />

        <div>
          <InputPassword
            label="Kata Sandi"
            name="password"
            placeholder="Masukkan kata sandi Anda"
            required
          />
          <div className="flex justify-end mt-2">
            <Link href="/forgot-password" className="text-sm text-primary-green hover:text-primary-green-hover font-medium">
              Lupa kata sandi?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base mt-2"
          isLoading={isLoading}
        >
          Masuk Sekarang
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary-green font-semibold hover:underline">
          Daftar di sini
        </Link>
      </div>
    </div>
  );
}
