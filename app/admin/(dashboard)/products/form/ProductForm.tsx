'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Tag, 
  Package, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  Layers, 
  DollarSign, 
  Percent,
  CheckCircle2
} from 'lucide-react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { saveProduct } from '@/app/actions/catalog';
import { toast } from 'react-hot-toast';
import { ProductImages } from './ProductImages';
import { PromoSettings } from './PromoSettings';
import { 
  type ProductFormProps, 
  type ProductFormData, 
  type ProductImage,
  PRODUCT_FORM_OPTIONS,
  DEFAULT_FORM_DATA 
} from './types';

export default function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
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

  const [images, setImages] = useState<ProductImage[]>(
    initialData?.images?.map((img) => ({ publicId: img.publicId, url: img.url })) || []
  );

  const handleUpdateFormData = (updates: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    // Auto generate slug if not already customized
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    setFormData((prev) => ({
      ...prev,
      title,
      slug: initialData?.slug && initialData.slug !== autoSlug ? prev.slug : autoSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Nama produk wajib diisi');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Harga produk harus lebih dari Rp 0');
      return;
    }

    if (formData.isPromo) {
      if (!formData.promoPercentage || !formData.promoExpiry) {
        toast.error('Persentase diskon dan batas tanggal promo wajib diisi jika promo aktif');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Process promoExpiry to 23:59:59 of that day
      let processedPromoExpiry: string | null = null;
      if (formData.isPromo && formData.promoExpiry) {
        const dateObj = new Date(formData.promoExpiry);
        dateObj.setHours(23, 59, 59, 999);
        processedPromoExpiry = dateObj.toISOString();
      }

      const res = await saveProduct(initialData?.id || null, {
        ...formData,
        promoExpiry: processedPromoExpiry,
        images,
      });

      if (res.success) {
        toast.success(initialData ? 'Perubahan produk berhasil disimpan' : 'Produk baru berhasil ditambahkan');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menyimpan produk');
      }
    } catch {
      toast.error('Terjadi kesalahan pada server saat menyimpan produk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 2-Column Master-Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Product Details & Herbal Medicine Specs (7/12) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Informasi Utama & Deskripsi */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileText size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Informasi Utama Produk</h2>
                <p className="text-[11px] text-gray-500">Nama resmi, slug URL, dan deskripsi khasiat.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Nama Produk Herbal"
                placeholder="Contoh: Minyak Habbatussauda Extra Virgin 100ml"
                value={formData.title}
                onChange={handleTitleChange}
                required
              />

              <div>
                <Input
                  label="Slug URL Produk"
                  placeholder="minyak-habbatussauda-extra-virgin-100ml"
                  value={formData.slug}
                  onChange={(e) => handleUpdateFormData({ slug: e.target.value })}
                  required
                />
                <div className="text-[11px] text-gray-400 font-mono mt-1 flex items-center gap-1 truncate">
                  <span>URL Publik:</span>
                  <span className="text-emerald-700 font-semibold truncate">/product/{formData.slug || 'slug-produk'}</span>
                </div>
              </div>

              <Textarea
                label="Khasiat & Manfaat Utama (Uses)"
                placeholder="Jelaskan kegunaan klinis atau tradisional produk ini secara rinci..."
                value={formData.uses}
                onChange={(e) => handleUpdateFormData({ uses: e.target.value })}
                rows={3}
                required
              />

              <Textarea
                label="Komposisi Bahan Herbal (Composition)"
                placeholder="Contoh: Tiap kapsul 500mg mengandung Oleum Nigella Sativa Semen 100%..."
                value={formData.composition}
                onChange={(e) => handleUpdateFormData({ composition: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          {/* Card 2: Petunjuk Medis & Peringatan */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <AlertCircle size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Petunjuk Penggunaan & Peringatan</h2>
                <p className="text-[11px] text-gray-500">Dosis konsumsi harian dan kontraindikasi.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <Textarea
                label="Aturan Pakai & Dosis (Directions)"
                placeholder="Contoh: Dewasa: 2 x 2 kapsul sehari sesudah makan. Anak-anak: 1 kapsul sehari..."
                value={formData.directions}
                onChange={(e) => handleUpdateFormData({ directions: e.target.value })}
                rows={2}
                required
              />

              <Textarea
                label="Peringatan & Kontraindikasi (Warnings)"
                placeholder="Contoh: Tidak dianjurkan untuk wanita hamil trimester pertama. Simpan di tempat kering..."
                value={formData.warnings}
                onChange={(e) => handleUpdateFormData({ warnings: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          {/* Card 3: Legalitas & Sertifikasi BPOM */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <ShieldCheck size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Legalitas & Sertifikasi BPOM</h2>
                <p className="text-[11px] text-gray-500">Bukti keabsahan izin edar obat tradisional / herbal.</p>
              </div>
            </div>

            <Input
              label="Nomor Izin Edar / Sertifikat (Certificate)"
              placeholder="Contoh: POM TR. 183318871 / Halal MUI No. 00140012340510"
              value={formData.certificate}
              onChange={(e) => handleUpdateFormData({ certificate: e.target.value })}
              required
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Media, Pricing, Taxonomy & Promo (5/12) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 4: Foto Produk */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-xs">
            <ProductImages
              images={images}
              onImagesChange={setImages}
              disabled={isLoading}
            />
          </div>

          {/* Card 5: Penetapan Harga & Stok Inventaris */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/70 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Package size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Harga & Inventaris Stok</h2>
                <p className="text-[11px] text-gray-500">Harga retail normal dan jumlah stok di gudang.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Harga Normal (Rp)"
                type="number"
                min="0"
                placeholder="Contoh: 85000"
                value={formData.price}
                onChange={(e) => handleUpdateFormData({ price: e.target.value })}
                required
              />

              <div>
                <Input
                  label="Stok Gudang"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleUpdateFormData({ quantity: e.target.value })}
                  required
                />
                {parseInt(formData.quantity || '0', 10) <= 5 && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1">
                    ⚠️ Stok kritis (≤ 5 unit)
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Select
                label="Kategori Produk"
                value={formData.categoryId}
                onChange={(e) => handleUpdateFormData({ categoryId: e.target.value })}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                required
              />

              <Select
                label="Bentuk Sediaan"
                value={formData.productForm}
                onChange={(e) => handleUpdateFormData({ productForm: e.target.value })}
                options={PRODUCT_FORM_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
                required
              />
            </div>
          </div>

          {/* Card 6: Pengaturan Promo & Flash Sale */}
          <PromoSettings
            formData={formData}
            onChange={handleUpdateFormData}
          />
        </div>
      </div>

      {/* Floating / Fixed Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-sm flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save size={15} />
          <span>{isLoading ? 'Menyimpan...' : initialData?.id ? 'Simpan Perubahan Produk' : 'Terbitkan Produk Baru'}</span>
        </button>
      </div>
    </form>
  );
}
