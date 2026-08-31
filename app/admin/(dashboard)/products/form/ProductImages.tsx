'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';
import { toast } from 'react-hot-toast';
import type { ProductImage } from './types';

interface ProductImagesProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  disabled?: boolean;
}

export function ProductImages({ images, onImagesChange, disabled }: ProductImagesProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar melebihi batas 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadImage(formData);

      if (res.error) {
        toast.error(res.error);
      } else if (res.success && res.data) {
        onImagesChange([...images, { publicId: res.data.publicId, url: res.data.url }]);
        toast.success('Foto produk berhasil diunggah');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-900 mb-0.5">
          Foto Galeri Produk
        </label>
        <p className="text-[11px] text-gray-500">
          Foto pertama akan dijadikan sebagai gambar sampul katalog utama.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Existing Images */}
        {images.map((img, index) => (
          <div
            key={img.publicId || index}
            className="relative aspect-square rounded-lg border border-gray-200/80 overflow-hidden bg-gray-50 flex items-center justify-center group"
          >
            <img
              src={img.url}
              alt={`Foto produk ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 bg-gray-900/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs flex items-center gap-0.5">
                <Sparkles size={8} /> Utama
              </span>
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 bg-white/95 text-red-600 hover:text-red-700 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer border border-gray-200"
              aria-label="Hapus foto"
              title="Hapus foto"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Upload Slot */}
        <label className={`
          aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-900 flex flex-col items-center justify-center cursor-pointer
          text-gray-400 hover:text-gray-900 transition-colors bg-gray-50/50 p-2 text-center
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span className="text-[10px] font-semibold text-gray-500">Mengunggah...</span>
            </div>
          ) : (
            <>
              <Upload size={16} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Tambah Foto</span>
              <span className="text-[9px] text-gray-400 mt-0.5">Maks 5MB</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading || disabled}
          />
        </label>
      </div>
    </div>
  );
}
