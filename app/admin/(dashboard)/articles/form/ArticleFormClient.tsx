'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Loader2, 
  Eye, 
  EyeOff, 
  Clock, 
  Upload, 
  Trash2, 
  Globe,
  FileText
} from 'lucide-react';
import { createArticle, updateArticle } from '@/app/actions/articles';
import { uploadImage } from '@/app/actions/upload';
import { Textarea } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { 
  ssr: false,
  loading: () => (
    <div className="h-80 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
      <Loader2 size={18} className="animate-spin mr-2" /> Memuat editor...
    </div>
  )
});

interface ArticleFormClientProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string | null;
    isPublished?: boolean;
    imageUrl?: string | null;
    imagePublicId?: string | null;
  } | null;
}

export default function ArticleFormClient({ initialData }: ArticleFormClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    isPublished: initialData?.isPublished ?? true,
    imageUrl: initialData?.imageUrl || '',
    imagePublicId: initialData?.imagePublicId || '',
  });

  // Calculate estimated reading time & word count
  const readingStats = useMemo(() => {
    const textOnly = formData.content.replace(/<[^>]+>/g, ' ').trim();
    const words = textOnly ? textOnly.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [formData.content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData(prev => ({
      ...prev,
      title,
      slug: initialData?.slug && initialData.slug !== autoSlug ? prev.slug : autoSlug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Mengunggah gambar sampul...');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'articles');

      const res = await uploadImage(formDataUpload);

      if ('success' in res && res.success && 'data' in res && res.data) {
        setFormData(prev => ({
          ...prev,
          imageUrl: res.data!.url,
          imagePublicId: res.data!.publicId
        }));
        toast.success('Gambar sampul berhasil diunggah', { id: toastId });
      } else {
        toast.error((res as any)?.error || 'Gagal mengunggah gambar', { id: toastId });
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah gambar', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      imagePublicId: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Judul artikel wajib diisi');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Konten artikel tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(initialData?.id ? 'Memperbarui artikel...' : 'Menerbitkan artikel baru...');

    try {
      let res: any;
      const payload: any = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        isPublished: formData.isPublished,
        featuredImage: formData.imageUrl ? {
          url: formData.imageUrl,
          publicId: formData.imagePublicId
        } : undefined,
      };

      if (initialData?.id) {
        res = await updateArticle(initialData.id, payload);
      } else {
        res = await createArticle(payload);
      }

      if (res && res.success) {
        toast.success(initialData?.id ? 'Artikel berhasil diperbarui' : 'Artikel baru berhasil diterbitkan', { id: toastId });
        router.push('/admin/articles');
        router.refresh();
      } else {
        toast.error(res?.error || 'Gagal menyimpan artikel', { id: toastId });
      }
    } catch {
      toast.error('Terjadi kesalahan pada server', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 2-Column Master-Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Clean Canvas Writing Area (8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-xs space-y-4">
            
            {/* Title Input */}
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Tulis Judul Artikel Herbal di Sini..."
                className="w-full text-xl sm:text-2xl font-bold tracking-tight text-gray-900 placeholder:text-gray-300 focus:outline-none border-b border-transparent focus:border-gray-300 pb-2 transition-colors"
                required
              />
            </div>

            {/* Meta Path & Reading Time Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-gray-100 text-xs">
              <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-gray-600 font-mono text-[11px]">
                <Globe size={12} className="text-gray-400" />
                <span className="text-gray-400">/blog/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="slug-artikel"
                  className="bg-transparent focus:outline-none text-gray-800 font-semibold max-w-[200px]"
                />
              </div>

              <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-gray-500 text-[11px] font-mono">
                <Clock size={11} className="text-gray-400" />
                <span>~{readingStats.minutes} mnt baca</span>
                <span>•</span>
                <span>{readingStats.words} kata</span>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700">
                  Isi Konten Artikel
                </label>
                <span className="text-[11px] text-gray-400">Format teks & gambar inline</span>
              </div>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Publication Settings, Cover Image & Excerpt (4/12) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Status & Quick Action */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Status Publikasi</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                formData.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {formData.isPublished ? 'Live' : 'Draf'}
              </span>
            </div>

            {/* Radio Selection */}
            <div className="space-y-2">
              <label 
                onClick={() => setFormData(prev => ({ ...prev, isPublished: true }))}
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.isPublished
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="publicationStatus"
                  checked={formData.isPublished}
                  onChange={() => {}}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <Eye size={13} className="text-emerald-600" /> Publikasikan Sekarang
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Artikel langsung tayang di blog publik.</p>
                </div>
              </label>

              <label 
                onClick={() => setFormData(prev => ({ ...prev, isPublished: false }))}
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  !formData.isPublished
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="publicationStatus"
                  checked={!formData.isPublished}
                  onChange={() => {}}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <EyeOff size={13} className="text-amber-600" /> Simpan sebagai Draf
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Hanya dapat diakses melalui panel admin.</p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{initialData?.id ? 'Simpan Perubahan' : 'Terbitkan Artikel'}</span>
                  </>
                )}
              </button>

              <Link
                href="/admin/articles"
                className="w-full text-center py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </Link>
            </div>
          </div>

          {/* Card 2: Cover Image */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Gambar Sampul</h2>
              <span className="text-[10px] text-gray-400 font-mono">16:9</span>
            </div>

            {formData.imageUrl ? (
              <div className="relative aspect-video rounded-lg border border-gray-200/80 overflow-hidden bg-gray-50 group">
                <img
                  src={formData.imageUrl}
                  alt="Cover Artikel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className={`
                aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-900 flex flex-col items-center justify-center cursor-pointer
                text-gray-400 hover:text-gray-900 transition-colors bg-gray-50/50 p-4 text-center
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <Loader2 size={18} className="animate-spin text-gray-700" />
                    <span className="text-xs font-semibold text-gray-600">Mengunggah...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="mb-1 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">Unggah Gambar Sampul</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Maks 2MB (JPG/PNG/WEBP)</span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          {/* Card 3: Ringkasan Cuplikan (Excerpt / SEO) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Ringkasan / Cuplikan (Excerpt)</h2>
              <FileText size={13} className="text-gray-400" />
            </div>

            <div>
              <Textarea
                placeholder="Tuliskan 1-2 kalimat ringkasan inti artikel untuk cuplikan pada kartu blog dan deskripsi Google..."
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="text-xs"
              />
              <div className="flex justify-between items-center mt-1 text-[10px] text-gray-400">
                <span>Cuplikan untuk kartu blog & SEO</span>
                <span>{formData.excerpt.length} karakter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
