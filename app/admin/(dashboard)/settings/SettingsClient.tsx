'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateStoreSettings } from '@/app/actions/settings';
import { uploadBannerData, toggleBanner, deleteBanner } from '@/app/actions/banner';
import { uploadImage, deleteImage } from '@/app/actions/upload';
import { toast } from 'react-hot-toast';
import { Upload, X, Check, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function SettingsClient({ initialSettings, initialBanners }: { initialSettings: any, initialBanners: any[] }) {
  const router = useRouter();
  
  // --- STATE FOR GENERAL SETTINGS ---
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [formData, setFormData] = useState({
    storeName: initialSettings?.storeName || 'PT. Al-Kautsar',
    email: initialSettings?.email || '',
    whatsapp: initialSettings?.whatsapp || '',
  });
  
  // Logo State
  const [logo, setLogo] = useState<{ url: string, publicId: string } | null>(
    initialSettings?.logoUrl ? { url: initialSettings.logoUrl, publicId: initialSettings.logoPublicId } : null
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // --- STATE FOR BANNERS ---
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // --- HANDLERS FOR GENERAL SETTINGS ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await uploadImage(form);
      if (res.success && res.data) {
        setLogo({ url: res.data.url, publicId: res.data.publicId });
        toast.success('Logo berhasil diunggah sementara. Jangan lupa klik Simpan.');
      } else {
        toast.error(res.error || 'Gagal mengunggah logo');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    // If it's the saved logo, we don't delete from cloudinary yet until Save is clicked
    // Just remove from UI state
    setLogo(null);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);

    try {
      const payload = {
        ...formData,
        logoUrl: logo ? logo.url : '',
        logoPublicId: logo ? logo.publicId : ''
      };

      const res = await updateStoreSettings(payload);
      if (res.success) {
        toast.success('Pengaturan umum berhasil disimpan!');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan server');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // --- HANDLERS FOR BANNERS ---
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    const form = new FormData();
    form.append('file', file);
    // You can prompt for a title here, but we will default to "Banner Baru" for simplicity
    form.append('title', `Banner ${new Date().toLocaleDateString()}`);

    try {
      const res = await uploadBannerData(form);
      if (res.success) {
        toast.success('Banner berhasil diunggah!');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal mengunggah banner');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleToggleBanner = async (id: string, currentStatus: boolean) => {
    const res = await toggleBanner(id, !currentStatus);
    if (res.success) {
      toast.success(currentStatus ? 'Banner dinonaktifkan' : 'Banner diaktifkan');
      router.refresh();
    } else {
      toast.error('Gagal mengubah status banner');
    }
  };

  const handleDeleteBanner = async (id: string, publicId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;
    
    const toastId = toast.loading('Menghapus banner...');
    const res = await deleteBanner(id, publicId);
    if (res.success) {
      toast.success('Banner berhasil dihapus', { id: toastId });
      router.refresh();
    } else {
      toast.error('Gagal menghapus banner', { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Toko</h1>
      </div>

      {/* --- BAGIAN 1: PENGATURAN UMUM --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-green-50 text-primary-green flex items-center justify-center">1</span>
          Profil & Kontak
        </h2>

        <form onSubmit={handleSaveGeneral} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Logo Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Perusahaan</label>
              <div className="flex gap-6 items-start">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative overflow-hidden group shrink-0">
                  {logo ? (
                    <>
                      <img src={logo.url} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                      <button 
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="text-gray-300" size={32} />
                  )}
                </div>
                
                <div className="flex flex-col justify-center gap-2 h-32">
                  <label className="bg-white border border-gray-200 hover:border-primary-green text-gray-700 hover:text-primary-green px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm inline-flex items-center justify-center gap-2">
                    {isUploadingLogo ? 'Uploading...' : <><Upload size={16} /> Pilih Gambar</>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                  </label>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                    Format JPG atau PNG. Ukuran maksimal 2MB. Disarankan berlatar transparan (PNG).
                  </p>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-4">
              <Input 
                label="Nama Toko" 
                value={formData.storeName}
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                required
              />
              <Input 
                label="Alamat Email (Opsional)" 
                type="email"
                placeholder="cs@alkautsar.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Input 
                label="Nomor WhatsApp Admin (Opsional)" 
                placeholder="6281234567890 (Gunakan awalan 62)"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={isSavingGeneral} className="min-w-[150px]">
              Simpan Profil
            </Button>
          </div>
        </form>
      </div>

      {/* --- BAGIAN 2: MANAJEMEN BANNER --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-50 text-primary-green flex items-center justify-center">2</span>
            Manajemen Banner
          </h2>
          
          <label className="bg-primary-green hover:bg-[#00c96b] text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-sm shadow-green-500/20 inline-flex items-center justify-center gap-2">
            {isUploadingBanner ? 'Uploading...' : <><Upload size={16} /> Upload Banner Baru</>}
            <input type="file" className="hidden" accept="image/*" onChange={handleBannerUpload} disabled={isUploadingBanner} />
          </label>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Banner yang berstatus "Aktif" (Switch hijau) akan ditampilkan bergantian di Halaman Utama (Homepage) pelanggan.
        </p>

        {initialBanners.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <ImageIcon size={48} className="mb-4 text-gray-300" />
            <p className="font-semibold text-gray-500">Belum ada banner yang diunggah.</p>
            <p className="text-sm">Klik tombol upload di kanan atas untuk menambahkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialBanners.map((banner) => (
              <div key={banner.id} className={`group rounded-2xl overflow-hidden border ${banner.isActive ? 'border-primary-green shadow-md' : 'border-gray-200 shadow-sm'} transition-all`}>
                {/* Banner Image */}
                <div className="aspect-[21/9] bg-gray-100 relative">
                  <img src={banner.url} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {banner.isActive ? (
                      <span className="bg-primary-green text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Check size={12} /> AKTIF
                      </span>
                    ) : (
                      <span className="bg-gray-800/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        NONAKTIF
                      </span>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteBanner(banner.id, banner.publicId)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm translate-y-2 group-hover:translate-y-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Banner Controls */}
                <div className="p-4 bg-white flex items-center justify-between">
                  <div className="flex-1 truncate mr-4">
                    <p className="font-semibold text-gray-900 text-sm truncate">{banner.title}</p>
                    <p className="text-xs text-gray-400">{new Date(banner.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={banner.isActive}
                      onChange={() => handleToggleBanner(banner.id, banner.isActive)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-green"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
