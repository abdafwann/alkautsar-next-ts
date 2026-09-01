'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Upload, 
  Check, 
  Image as ImageIcon, 
  Trash2, 
  Globe, 
  Layers, 
  Sparkles, 
  FileText,
  AlertCircle,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateStoreSettings } from '@/app/actions/settings';
import { uploadBannerData, toggleBanner, deleteBanner } from '@/app/actions/banner';
import { uploadImage } from '@/app/actions/upload';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

interface StoreSettingsData {
  id?: string;
  storeName?: string | null;
  description?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  updatedAt?: Date | string;
}

interface BannerData {
  id: string;
  title: string | null;
  url: string;
  publicId: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

interface SettingsClientProps {
  initialSettings: StoreSettingsData | null;
  initialBanners: BannerData[];
}

export default function SettingsClient({ initialSettings, initialBanners }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'banners' | 'preview'>('profile');

  // --- GENERAL SETTINGS STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: initialSettings?.storeName || 'PT. Al-Kautsar',
    description: initialSettings?.description || '',
    email: initialSettings?.email || '',
    whatsapp: initialSettings?.whatsapp || '',
    address: initialSettings?.address || '',
  });

  // Logo State
  const [logo, setLogo] = useState<{ url: string; publicId: string } | null>(
    initialSettings?.logoUrl
      ? { url: initialSettings.logoUrl, publicId: initialSettings.logoPublicId || '' }
      : null
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // --- BANNER MANAGEMENT STATE ---
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Logo Upload Handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran logo maksimal 2MB');
      return;
    }

    setIsUploadingLogo(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await uploadImage(form);
      if (res.success && res.data) {
        setLogo({ url: res.data.url, publicId: res.data.publicId });
        toast.success('Logo berhasil diunggah. Klik "Simpan Pengaturan" untuk menerapkan perubahan.');
      } else {
        toast.error(res.error || 'Gagal mengunggah logo');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah file logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  // Save General Settings Handler
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        logoUrl: logo ? logo.url : '',
        logoPublicId: logo ? logo.publicId : '',
      };

      const res = await updateStoreSettings(payload);
      if (res.success) {
        toast.success('Pengaturan profil toko berhasil diperbarui');
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || 'Gagal memperbarui pengaturan toko');
      }
    } catch {
      toast.error('Terjadi kesalahan internal server');
    } finally {
      setIsSaving(false);
    }
  };

  // Banner Upload Handler
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran banner maksimal 5MB');
      return;
    }

    setIsUploadingBanner(true);
    const form = new FormData();
    form.append('file', file);
    form.append('title', `Banner Promosi ${new Date().toLocaleDateString('id-ID')}`);

    try {
      const res = await uploadBannerData(form);
      if (res.success) {
        toast.success('Banner baru berhasil ditambahkan');
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || 'Gagal mengunggah banner');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses gambar banner');
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  const handleToggleBanner = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleBanner(id, !currentStatus);
      if (res.success) {
        toast.success(currentStatus ? 'Banner dinonaktifkan' : 'Banner diaktifkan');
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error('Gagal memperbarui status banner');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan');
    }
  };

  const handleDeleteBanner = async (id: string, publicId: string) => {
    if (!window.confirm('Hapus banner ini dari daftar tayang?')) return;

    const toastId = toast.loading('Menghapus banner...');
    try {
      const res = await deleteBanner(id, publicId);
      if (res.success) {
        toast.success('Banner berhasil dihapus permanen', { id: toastId });
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || 'Gagal menghapus banner', { id: toastId });
      }
    } catch {
      toast.error('Terjadi kesalahan server saat menghapus', { id: toastId });
    }
  };

  const activeBannersCount = initialBanners.filter((b) => b.isActive).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Pengaturan Toko
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#00AA5B] border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00AA5B] animate-pulse"></span>
              Toko Aktif
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Konfigurasi identitas merek, informasi kontak, alamat operasional, dan materi promosi visual.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="inline-flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Store size={14} className={activeTab === 'profile' ? 'text-[#00AA5B]' : 'text-gray-400'} />
            Profil & Kontak
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('banners')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'banners'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Layers size={14} className={activeTab === 'banners' ? 'text-[#00AA5B]' : 'text-gray-400'} />
            Banner Promosi
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700 font-bold">
              {initialBanners.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Eye size={14} className={activeTab === 'preview' ? 'text-[#00AA5B]' : 'text-gray-400'} />
            Pratinjau Footer
          </button>
        </div>
      </div>

      {/* TAB 1: PROFIL & KONTAK */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveGeneral} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Brand Logo & Guidelines (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00AA5B] flex items-center justify-center font-bold">
                    <Store size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Logo Toko</h2>
                    <p className="text-xs text-gray-500">Tampil pada Navbar, Invoice, dan Email</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center">
                  <div className="w-full aspect-square max-w-[200px] rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative overflow-hidden group transition-colors hover:border-[#00AA5B]/60">
                    {logo ? (
                      <>
                        <img 
                          src={logo.url} 
                          alt="Logo Toko" 
                          className="w-full h-full object-contain p-4 transition-transform duration-200 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="p-2 rounded-xl bg-white text-red-600 hover:bg-red-50 transition-colors shadow-md text-xs font-bold flex items-center gap-1"
                            title="Hapus Logo"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4 text-gray-400">
                        <ImageIcon size={36} strokeWidth={1.5} className="mb-2 text-gray-300" />
                        <span className="text-xs font-semibold text-gray-500">Belum Ada Logo</span>
                        <span className="text-[11px] text-gray-400 mt-0.5">Maksimal 2MB (PNG/JPG)</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex justify-center w-full">
                    <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#00AA5B] bg-white text-gray-700 hover:text-[#00AA5B] text-xs font-semibold cursor-pointer transition-all shadow-2xs active:scale-98">
                      {isUploadingLogo ? (
                        <span>Mengunggah...</span>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>{logo ? 'Ganti Logo' : 'Pilih File Logo'}</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/webp, image/svg+xml" 
                        onChange={handleLogoUpload} 
                        disabled={isUploadingLogo} 
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                    <ShieldCheck size={14} className="text-[#00AA5B]" />
                    <span>Rekomendasi Format:</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Gunakan format PNG berlatar belakang transparan dengan rasio proporsional agar kontras di latar terang dan gelap.
                  </p>
                </div>
              </div>

              {/* Quick Status Card */}
              <div className="bg-gradient-to-br from-emerald-900 to-[#122b1c] text-white rounded-2xl p-5 shadow-xs border border-emerald-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">Sinkronisasi</span>
                  <Globe size={16} className="text-emerald-300" />
                </div>
                <p className="text-sm font-semibold leading-snug">
                  Data yang Anda simpan di halaman ini otomatis disinkronkan ke seluruh storefront dan halaman publik.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/80 font-medium">
                  <span>Status Cache: Aktif</span>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-md">Auto Revalidate</span>
                </div>
              </div>
            </div>

            {/* Right Column: Identity, Contacts & Store Narrative (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Section: Identitas & Deskripsi */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <FileText size={18} className="text-[#00AA5B]" />
                  <h2 className="text-sm font-bold text-gray-900">Identitas & Narasi Merek</h2>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nama Resmi Toko / Perusahaan"
                    placeholder="Contoh: PT. Al-Kautsar Perkasa Indonesia"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    required
                  />

                  <div>
                    <Textarea
                      label="Deskripsi Singkat Toko (Footer & About)"
                      placeholder="Contoh: Menyediakan akses ke obat alami, herbal, dan tradisional berstandar resmi BPOM untuk kebugaran keseharian Anda."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="flex justify-between items-center mt-1.5 px-0.5">
                      <p className="text-[11px] text-gray-400">
                        Teks ini dirender di kolom utama Footer toko Anda untuk menyampaikan visi dan reputasi produk.
                      </p>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {formData.description.length} karakter
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Kontak & Alamat Operasional */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <MapPin size={18} className="text-[#00AA5B]" />
                  <h2 className="text-sm font-bold text-gray-900">Kontak Resmi & Alamat Operasional</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Nomor WhatsApp Customer Service"
                      placeholder="6281234567890 (Awali dengan kode negara 62)"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Terhubung otomatis ke tombol chat WhatsApp mengambang di toko.
                    </p>
                  </div>

                  <div>
                    <Input
                      label="Email Dukungan / Layanan Pelanggan"
                      type="email"
                      placeholder="cs@alkautsar.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Ditampilkan pada footer dan halaman kontak resmi.
                    </p>
                  </div>
                </div>

                <div>
                  <Textarea
                    label="Alamat Lengkap Toko / Kantor Operasional"
                    placeholder="Contoh: Jl. Herbal Alami No. 123, Kebayoran Baru, Jakarta Selatan, 12345"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value})}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Gunakan format baris baru jika ingin memisahkan nama gedung, jalan, kota, dan kode pos.
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle size={14} className="text-amber-500 shrink-0" />
                  <span>Perubahan langsung tersimpan ke database.</span>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSaving || isPending}
                  className="w-full sm:w-auto px-4 py-2 bg-[#00AA5B] hover:bg-[#00924e] text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  <Check size={14} className="mr-1" />
                  Simpan Pengaturan
                </Button>
              </div>

            </div>
          </div>
        </form>
      )}

      {/* TAB 2: BANNER PROMOSI */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-[#00AA5B]" />
                <h2 className="text-lg font-bold text-gray-900">Manajemen Banner Beranda</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Banner aktif ({activeBannersCount} dari {initialBanners.length}) akan ditampilkan bergantian di carousel halaman utama pelanggan.
              </p>
            </div>

            <label className="bg-[#00AA5B] hover:bg-[#00924e] text-white px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs inline-flex items-center gap-1.5 active:scale-98">
              {isUploadingBanner ? (
                <span>Mengunggah...</span>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Unggah Banner Baru</span>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleBannerUpload} 
                disabled={isUploadingBanner} 
              />
            </label>
          </div>

          {initialBanners.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center mb-4">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800">Belum Ada Banner</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6 leading-relaxed">
                Unggah gambar promosi atau pengumuman dengan rasio 21:9 atau 16:9 untuk dipasang di bagian teratas beranda toko.
              </p>
              <label className="bg-white border border-gray-200 hover:border-[#00AA5B] text-gray-700 hover:text-[#00AA5B] px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs inline-flex items-center gap-1.5">
                <Upload size={13} /> Pilih File Banner
                <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isUploadingBanner} />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialBanners.map((banner) => (
                <div 
                  key={banner.id} 
                  className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 shadow-2xs hover:shadow-md ${
                    banner.isActive ? 'border-[#00AA5B]/50 ring-1 ring-[#00AA5B]/20' : 'border-gray-200/80 opacity-85'
                  }`}
                >
                  {/* Banner Preview Card */}
                  <div className="aspect-[21/9] bg-gray-100 relative group overflow-hidden">
                    <img 
                      src={banner.url} 
                      alt={banner.title || 'Banner Promosi'} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103" 
                    />
                    
                    {/* Status Pill Badge */}
                    <div className="absolute top-3 left-3">
                      {banner.isActive ? (
                        <span className="bg-[#00AA5B] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Check size={11} strokeWidth={3} /> AKTIF
                        </span>
                      ) : (
                        <span className="bg-gray-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          NONAKTIF
                        </span>
                      )}
                    </div>

                    {/* Delete Action Button */}
                    <button 
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id, banner.publicId)}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer active:scale-95"
                      title="Hapus Banner"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Banner Controls & Date */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-xs truncate">
                        {banner.title || 'Banner Promosi'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                        {new Date(banner.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-gray-500">
                        {banner.isActive ? 'Tayang' : 'Mati'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={banner.isActive}
                          onChange={() => handleToggleBanner(banner.id, banner.isActive)}
                        />
                        <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#00AA5B]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE PREVIEW FOOTER */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Simulasi Tampilan Footer Toko</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Berikut adalah simulasi langsung bagian footer website dengan data yang Anda konfigurasikan saat ini.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-[#00AA5B] rounded-lg border border-emerald-100 flex items-center gap-1.5">
                <Sparkles size={14} /> Live Preview
              </span>
            </div>
          </div>

          {/* Simulated Footer Box */}
          <div className="rounded-3xl overflow-hidden border-4 border-[#00AA5B] shadow-xl bg-[#122b1c] text-white p-8 md:p-12">
            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Brand & Narrative */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  {logo ? (
                    <img src={logo.url} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
                  ) : (
                    <span className="w-7 h-7 rounded-lg bg-[#00AA5B] flex items-center justify-center text-white font-bold text-sm">
                      A
                    </span>
                  )}
                  <h3 className="text-lg font-extrabold tracking-tight text-white">
                    {formData.storeName || 'PT. AL-KAUTSAR'}
                  </h3>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line max-w-sm">
                  {formData.description || 'Menyediakan akses ke obat alami, herbal, dan tradisional berstandar resmi BPOM untuk kebugaran keseharian Anda.'}
                </p>

                <div className="space-y-2.5 text-xs text-gray-300 font-medium pt-2">
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-[#00AA5B] shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line leading-relaxed">
                      {formData.address || 'Jl. Herbal Alami No. 123\nJakarta Selatan, 12345'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone size={15} className="text-[#00AA5B] shrink-0" />
                    <span>{formData.whatsapp || '+62 812 3456 7890'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail size={15} className="text-[#00AA5B] shrink-0" />
                    <span>{formData.email || 'hello@alkautsar.com'}</span>
                  </div>
                </div>
              </div>

              {/* Sample Footer Columns */}
              <div className="md:col-span-3 space-y-3">
                <h4 className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Eksplorasi</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li className="text-gray-400 hover:text-white cursor-pointer">Katalog Belanja</li>
                  <li className="text-gray-400 hover:text-white cursor-pointer">Artikel Kesehatan</li>
                  <li className="text-gray-400 hover:text-white cursor-pointer">Tentang Kami</li>
                  <li className="text-gray-400 hover:text-white cursor-pointer">Hubungi Kami</li>
                </ul>
              </div>

              <div className="md:col-span-3 space-y-3">
                <h4 className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Sertifikasi Resmi</h4>
                <div className="flex items-center gap-2 pt-1">
                  <div className="bg-white px-2.5 py-1.5 rounded-lg text-[10px] font-black text-gray-900 tracking-wider">
                    BPOM RI
                  </div>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg text-[10px] font-black text-gray-900 tracking-wider">
                    HALAL MUI
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <p>© {new Date().getFullYear()} {formData.storeName || 'PT. AL-KAUTSAR'}. Hak cipta dilindungi undang-undang.</p>
              <span className="text-[#00AA5B] font-semibold">Tampilan Sesuai Konfigurasi</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
