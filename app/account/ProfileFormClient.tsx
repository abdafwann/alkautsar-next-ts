'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProfile } from '@/app/actions/account';
import { requestEmailChange, verifyEmailChange } from '@/app/actions/emailAuth';
import { toast } from 'react-hot-toast';

export function ProfileFormClient({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailValue, setEmailValue] = useState(initialData.email || '');
  
  // Modal states for Email Change
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<'request' | 'verify'>('request');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);

    if (res.success) {
      toast.success('Profil berhasil diperbarui!');
    } else {
      toast.error(res.error || 'Gagal memperbarui profil');
    }

    setIsLoading(false);
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === emailValue) {
      toast.error('Silakan masukkan email baru yang valid.');
      return;
    }
    setIsEmailLoading(true);
    const res = await requestEmailChange(newEmail);
    if (res.success) {
      toast.success('OTP telah dikirim ke email baru Anda.');
      setEmailStep('verify');
    } else {
      toast.error(res.error || 'Gagal meminta penggantian email.');
    }
    setIsEmailLoading(false);
  };

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Masukkan 6 digit kode OTP.');
      return;
    }
    setIsEmailLoading(true);
    const res = await verifyEmailChange(otp);
    if (res.success) {
      toast.success('Email berhasil diubah!');
      setEmailValue(res.newEmail);
      setIsEmailModalOpen(false);
      setEmailStep('request');
      setNewEmail('');
      setOtp('');
    } else {
      toast.error(res.error || 'Kode OTP salah atau kedaluwarsa.');
    }
    setIsEmailLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl relative z-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nama Lengkap"
            name="name"
            defaultValue={initialData.name || ''}
            placeholder="Masukkan nama lengkap"
            required
            className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
          />
          <div className="relative">
            <Input
              label="Email"
              name="email"
              value={emailValue}
              disabled
              className="bg-gray-100 border-transparent rounded-2xl text-gray-500 pr-20"
            />
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="absolute right-3 top-[34px] text-xs font-bold text-primary-green hover:text-primary-green-hover px-2 py-1 rounded-md hover:bg-green-50 transition-colors"
            >
              Ubah
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nomor HP / WhatsApp"
            name="mobile"
            defaultValue={initialData.mobile || ''}
            placeholder="0812xxxxxx"
            className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
          />
          <Input
            label="Kode Pos"
            name="postalCode"
            defaultValue={initialData.postalCode || ''}
            placeholder="Masukkan kode pos"
            className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Provinsi"
            name="province"
            defaultValue={initialData.province || ''}
            placeholder="Contoh: Jawa Timur"
            className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
          />
          <Input
            label="Kota/Kabupaten"
            name="city"
            defaultValue={initialData.city || ''}
            placeholder="Contoh: Surabaya"
            className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Alamat Lengkap</label>
          <textarea
            name="address"
            defaultValue={initialData.address || ''}
            rows={3}
            placeholder="Nama jalan, gedung, no. rumah, dll"
            className="block w-full rounded-2xl border-transparent bg-zinc-50 px-4 py-3 text-sm text-gray-900 transition-colors focus:border-primary-green focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-green"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-primary-green hover:bg-primary-green-hover"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>

      {/* Modal Ubah Email */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Ubah Email</h3>
              <button 
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailStep('request');
                  setNewEmail('');
                  setOtp('');
                }}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                ✕
              </button>
            </div>

            {emailStep === 'request' ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">Masukkan email baru Anda. Kami akan mengirimkan 6-digit kode OTP ke email tersebut untuk verifikasi.</p>
                <Input
                  label="Email Baru"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contoh@emailbaru.com"
                  required
                  className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white"
                />
                <Button 
                  type="submit" 
                  isLoading={isEmailLoading}
                  className="w-full h-12 rounded-full bg-primary-green hover:bg-primary-green-hover mt-2"
                >
                  Kirim Kode OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">
                  Kode OTP telah dikirim ke <span className="font-bold text-gray-900">{newEmail}</span>. Masukkan kode tersebut di bawah ini.
                </p>
                <Input
                  label="Kode OTP (6 Digit)"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  required
                  className="bg-zinc-50 border-transparent rounded-2xl focus:bg-white text-center text-xl tracking-[0.5em] font-mono"
                />
                <Button 
                  type="submit" 
                  isLoading={isEmailLoading}
                  className="w-full h-12 rounded-full bg-primary-green hover:bg-primary-green-hover mt-2"
                >
                  Verifikasi & Simpan
                </Button>
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => setEmailStep('request')}
                    className="text-sm text-gray-500 hover:text-gray-900 underline"
                  >
                    Ubah email tujuan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
