'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/app/actions/auth';
import { Store, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(null, formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      router.push('/admin');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Header Area */}
        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-green-50 text-primary-green rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Portal
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Silakan masuk untuk mengelola toko
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center">
            {error}
          </div>
        )}

        {/* Form Container */}
        <div className="p-8 pt-2 relative">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Admin</label>
              <input 
                type="email" 
                name="email"
                required
                placeholder="admin@alkautsar.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-4 w-full bg-primary-green text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-primary-green-hover transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Masuk Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
