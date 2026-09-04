'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProfile } from '@/app/actions/account';
import { requestEmailChange, verifyEmailChange } from '@/app/actions/emailAuth';
import { toast } from 'react-hot-toast';
import { ShieldCheck, EnvelopeSimple, Key, X, FloppyDisk } from '@phosphor-icons/react';

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
    const sanitizedEmail = newEmail.trim().toLowerCase();
    if (!sanitizedEmail || sanitizedEmail === emailValue) {
      toast.error('Silakan masukkan email baru yang valid.');
      return;
    }
    setIsEmailLoading(true);
    const res = await requestEmailChange(sanitizedEmail);
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
    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      toast.error('Masukkan 6 digit kode OTP.');
      return;
    }
    setIsEmailLoading(true);
    const res = await verifyEmailChange(cleanOtp);
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
        
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-main mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <Input
              name="name"
              defaultValue={initialData.name || ''}
              placeholder="Masukkan nama lengkap Anda"
              required
              maxLength={100}
              className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-text-main">
                Alamat Email
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck size={12} weight="fill" />
                <span>Terverifikasi</span>
              </span>
            </div>
            <div className="relative">
              <input
                name="email"
                value={emailValue}
                disabled
                className="w-full bg-[#f3efe8]/70 border border-[#ede8de] rounded-xl text-xs py-2.5 px-3 text-text-main/70 cursor-not-allowed pr-16"
              />
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-dark-green hover:text-primary-green px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Ubah
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: WhatsApp & Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-main mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <Input
              name="mobile"
              defaultValue={initialData.mobile || ''}
              placeholder="08xxxxxxxxxx"
              maxLength={20}
              className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-main mb-1.5">
              Kode Pos
            </label>
            <Input
              name="postalCode"
              defaultValue={initialData.postalCode || ''}
              placeholder="Contoh: 12345"
              maxLength={10}
              className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
            />
          </div>
        </div>

        {/* Row 3: Province & City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-main mb-1.5">
              Provinsi
            </label>
            <Input
              name="province"
              defaultValue={initialData.province || ''}
              placeholder="Contoh: Jawa Timur"
              maxLength={100}
              className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-main mb-1.5">
              Kota / Kabupaten
            </label>
            <Input
              name="city"
              defaultValue={initialData.city || ''}
              placeholder="Contoh: Kota Surabaya"
              maxLength={100}
              className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5 transition-all placeholder:text-text-main/40"
            />
          </div>
        </div>

        {/* Row 4: Full Address */}
        <div>
          <label className="block text-xs font-bold text-text-main mb-1.5">
            Alamat Pengiriman Lengkap
          </label>
          <textarea
            name="address"
            defaultValue={initialData.address || ''}
            rows={3}
            maxLength={500}
            placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan lokasi"
            className="block w-full rounded-xl border border-[#ede8de] bg-[#faf9f6] px-3.5 py-2.5 text-xs text-text-main transition-all focus:border-primary-green focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-green placeholder:text-text-main/40 leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <Button 
            type="submit" 
            isLoading={isLoading}
            className="h-10 px-6 rounded-xl bg-dark-green hover:bg-primary-green text-white font-bold text-xs transition-all shadow-2xs active:scale-[0.98] cursor-pointer flex items-center gap-2"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>Simpan Perubahan</span>
          </Button>
        </div>
      </form>

      {/* Modal Ubah Email (TasteSkill v2 Floating Backdrop) */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-[#ede8de] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#ede8de]">
              <div className="flex items-center gap-2">
                <EnvelopeSimple size={20} weight="duotone" className="text-primary-green" />
                <h3 className="font-serif font-bold text-base text-text-main">
                  Ganti Alamat Email
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailStep('request');
                  setNewEmail('');
                  setOtp('');
                }}
                className="text-text-main/40 hover:text-text-main p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {emailStep === 'request' ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <p className="text-xs text-text-main/70 leading-relaxed">
                  Masukkan alamat email baru. Kami akan mengirimkan 6 digit kode OTP untuk konfirmasi keamanan akun Anda.
                </p>
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5">
                    Email Baru
                  </label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@emailbaru.com"
                    required
                    className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-xs py-2.5"
                  />
                </div>
                <Button 
                  type="submit" 
                  isLoading={isEmailLoading}
                  className="w-full h-10 rounded-xl bg-dark-green hover:bg-primary-green text-white font-bold text-xs mt-2 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                >
                  Kirim Kode OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                <p className="text-xs text-text-main/70 leading-relaxed">
                  Kode OTP 6 digit telah dikirim ke <strong className="text-text-main">{newEmail}</strong>.
                </p>
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1.5 text-center">
                    Masukkan 6 Digit OTP
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    required
                    className="bg-[#faf9f6] border-[#ede8de] focus:border-primary-green focus:bg-white rounded-xl text-center text-xl tracking-[0.4em] font-mono font-bold text-dark-green py-3"
                  />
                </div>
                <Button 
                  type="submit" 
                  isLoading={isEmailLoading}
                  className="w-full h-10 rounded-xl bg-dark-green hover:bg-primary-green text-white font-bold text-xs mt-2 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                >
                  Verifikasi &amp; Perbarui Email
                </Button>
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => setEmailStep('request')}
                    className="text-xs font-bold text-primary-green hover:underline cursor-pointer"
                  >
                    Ganti email tujuan
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
