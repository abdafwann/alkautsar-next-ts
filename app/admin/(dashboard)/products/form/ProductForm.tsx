'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { saveProduct } from '@/app/actions/catalog';
import { uploadImage } from '@/app/actions/upload';
import { toast } from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

export default function ProductForm({ initialData, categories }: { initialData?: any, categories: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    uses: initialData?.uses || '',
    price: initialData?.price?.toString() || '',
    categoryId: initialData?.categoryId || (categories.length > 0 ? categories[0].id : ''),
    productForm: initialData?.productForm || 'Kapsul',
    composition: initialData?.composition || '',
    directions: initialData?.directions || '',
    warnings: initialData?.warnings || '',
    certificate: initialData?.certificate || '',
    quantity: initialData?.quantity?.toString() || '0',
    isPromo: initialData?.isPromo || false,
    promoPercentage: initialData?.promoPercentage?.toString() || '',
    promoPrice: initialData?.promoPrice?.toString() || '',
    promoExpiry: initialData?.promoExpiry ? new Date(initialData.promoExpiry).toISOString().split('T')[0] : '',
  });

  const [images, setImages] = useState<{ publicId: string, url: string }[]>(
    initialData?.images?.map((img: any) => ({ publicId: img.publicId, url: img.url })) || []
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    // Auto generate slug if not editing or if slug is empty
    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title, slug: autoSlug });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await uploadImage(form);
      if (res.success) {
        setImages([...images, { publicId: res.data.public_id, url: res.data.secure_url }]);
        toast.success('Gambar berhasil diunggah');
      } else {
        toast.error(res.error || 'Gagal mengunggah gambar');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = e.target.value;
    let newPromoPrice = formData.promoPrice;
    
    // Auto calculate if promo is active and percentage exists
    if (formData.isPromo && formData.promoPercentage) {
      const percentage = parseFloat(formData.promoPercentage);
      const price = parseFloat(newPrice);
      if (!isNaN(percentage) && !isNaN(price)) {
        newPromoPrice = Math.round(price - (price * percentage / 100)).toString();
      }
    }
    
    setFormData({ ...formData, price: newPrice, promoPrice: newPromoPrice });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = e.target.value;
    let newPromoPrice = formData.promoPrice;
    
    // Auto calculate based on current price
    if (formData.price && percentage) {
      const percVal = parseFloat(percentage);
      const priceVal = parseFloat(formData.price);
      if (!isNaN(percVal) && !isNaN(priceVal)) {
        newPromoPrice = Math.round(priceVal - (priceVal * percVal / 100)).toString();
      }
    }
    
    setFormData({ ...formData, promoPercentage: percentage, promoPrice: newPromoPrice });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Modify promoExpiry to be 23:59:59 of that day
      let processedPromoExpiry = null;
      if (formData.isPromo && formData.promoExpiry) {
        const dateObj = new Date(formData.promoExpiry);
        dateObj.setHours(23, 59, 59, 999);
        processedPromoExpiry = dateObj.toISOString();
      }

      const res = await saveProduct(initialData?.id || null, {
        ...formData,
        promoExpiry: processedPromoExpiry,
        images
      });

      if (res.success) {
        toast.success(initialData ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menyimpan produk');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Nama Produk" 
          placeholder="Misal: Habbatussauda Extra Propolis" 
          value={formData.title}
          onChange={handleTitleChange}
          required 
        />
        <Input 
          label="Slug (URL)" 
          placeholder="habbatussauda-extra-propolis" 
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Input 
          label="Harga (Rp)" 
          type="number" 
          placeholder="0" 
          value={formData.price}
          onChange={handlePriceChange}
          required 
        />
        <Input 
          label="Stok" 
          type="number" 
          placeholder="0" 
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required 
        />
        <Select 
          label="Kategori"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          options={categories.map(c => ({ value: c.id, label: c.name }))}
          required
        />
        <Select 
          label="Bentuk Sediaan"
          value={formData.productForm}
          onChange={(e) => setFormData({ ...formData, productForm: e.target.value })}
          options={[
            { value: 'Kapsul', label: 'Kapsul' },
            { value: 'Sirup', label: 'Sirup / Cair' },
            { value: 'Serbuk', label: 'Serbuk' },
            { value: 'Minyak', label: 'Minyak' },
            { value: 'Lainnya', label: 'Lainnya' },
          ]}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gambar Produk</label>
        <div className="flex flex-wrap gap-4 items-center">
          {images.map((img, index) => (
            <div key={index} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 group">
              <img src={img.url} alt="Product" className="max-h-full object-contain" />
              <button 
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-green hover:text-primary-green transition-colors cursor-pointer shrink-0 bg-gray-50/50">
            {isUploading ? (
              <span className="text-xs font-semibold animate-pulse">Loading...</span>
            ) : (
              <>
                <Upload size={20} className="mb-1" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Upload</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">Format yang disarankan: JPG, PNG. Maksimal 5MB.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Textarea 
          label="Khasiat / Kegunaan (Uses)" 
          placeholder="Secara tradisional digunakan untuk..." 
          value={formData.uses}
          onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
          required 
        />
        <Textarea 
          label="Komposisi (Composition)" 
          placeholder="Tiap kapsul mengandung..." 
          value={formData.composition}
          onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Textarea 
          label="Aturan Pakai (Directions)" 
          placeholder="3 x sehari 1-2 kapsul..." 
          value={formData.directions}
          onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
          required 
        />
        <Textarea 
          label="Peringatan (Warnings)" 
          placeholder="Tidak boleh digunakan oleh anak di bawah 2 tahun..." 
          value={formData.warnings}
          onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-6">
        <Input 
          label="Nomor Izin Edar / Sertifikat (Certificate)" 
          placeholder="POM TR. XXXXXXXX" 
          value={formData.certificate}
          onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
          required 
        />
        
        <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Pengaturan Promo</h3>
              <p className="text-xs text-gray-500 mt-1">Aktifkan untuk memberikan diskon pada produk ini.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.isPromo}
                onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-green"></div>
            </label>
          </div>

          {formData.isPromo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <Input 
                label="Persentase Diskon (%)" 
                type="number" 
                placeholder="Misal: 10" 
                value={formData.promoPercentage}
                onChange={handlePercentageChange}
              />
              <Input 
                label="Harga Setelah Diskon (Rp)" 
                type="number" 
                placeholder="Otomatis dihitung" 
                value={formData.promoPrice}
                onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                readOnly
                className="bg-gray-50 font-bold text-primary-green"
              />
              <Input 
                label="Berlaku Sampai" 
                type="date" 
                value={formData.promoExpiry}
                onChange={(e) => setFormData({ ...formData, promoExpiry: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Simpan Perubahan' : 'Tambahkan Produk'}
        </Button>
      </div>
    </form>
  );
}
