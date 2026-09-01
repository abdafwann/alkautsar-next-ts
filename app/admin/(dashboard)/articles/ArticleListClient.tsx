'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  X, 
  FileText, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { deleteArticle, getArticles } from '@/app/actions/articles';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  isPublished: boolean;
  topic?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface ArticleListClientProps {
  initialArticles: Article[];
  error?: string;
}

const DUMMY_ARTICLES: Article[] = [
  {
    id: 'art-preview-001',
    title: '7 Manfaat Luar Biasa Minyak Habbatussauda untuk Daya Tahan Tubuh',
    slug: '7-manfaat-luar-biasa-minyak-habbatussauda',
    content: 'Minyak jintan hitam atau habbatussauda telah digunakan ribuan tahun dalam tradisi thibbun nabawi...',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&auto=format&fit=crop&q=80',
    isPublished: true,
    topic: 'Thibbun Nabawi',
    createdAt: '2026-08-25T08:30:00.000Z',
  },
  {
    id: 'art-preview-002',
    title: 'Mengenal Khasiat Madu Murni Randu untuk Kesehatan Lambung & Pencernaan',
    slug: 'khasiat-madu-murni-randu-pencernaan',
    content: 'Madu randu asli kaya akan enzim diastase alami yang membantu meredakan inflamasi mukosa lambung...',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop&q=80',
    isPublished: true,
    topic: 'Herbal & Madu',
    createdAt: '2026-08-18T14:15:00.000Z',
  },
  {
    id: 'art-preview-003',
    title: 'Panduan Praktis Penggunaan Daun Bidara untuk Terapi Ruqyah & Mandi Herbal',
    slug: 'panduan-praktis-daun-bidara-terapi-ruqyah',
    content: 'Daun bidara (Sidr) memiliki kedudukan istimewa dalam pengobatan herbal sunnah...',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    isPublished: false, // Draft
    topic: 'Edukasi Sunnah',
    createdAt: '2026-08-28T09:00:00.000Z',
  },
];

export default function ArticleListClient({ initialArticles, error }: ArticleListClientProps) {
  const { t, locale } = useAdminLanguage();
  const dateLocale = locale === 'EN' ? enUS : idLocale;
  const [articles, setArticles] = useState<Article[]>(
    initialArticles && initialArticles.length > 0 ? initialArticles : DUMMY_ARTICLES
  );
  const [isUsingDummy, setIsUsingDummy] = useState(
    !initialArticles || initialArticles.length === 0
  );

  const filterTabs = useMemo(() => [
    { id: 'ALL', label: locale === 'EN' ? 'All Articles' : 'Semua Artikel' },
    { id: 'PUBLISHED', label: locale === 'EN' ? 'Published' : 'Terbit' },
    { id: 'DRAFT', label: locale === 'EN' ? 'Draft' : 'Draf' },
  ], [locale]);

  // Filters & State
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'title_asc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh DB data
  const refreshDatabase = useCallback(async () => {
    try {
      const res = await getArticles(true);
      if (res.success && res.data && res.data.length > 0) {
        setArticles(res.data as Article[]);
        setIsUsingDummy(false);
        toast.success(`Berhasil sinkronisasi: ${res.data.length} artikel termuat dari database.`);
      } else {
        toast('Database masih kosong. Tetap menampilkan preview data dummy.', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Gagal menghubungi database.');
    }
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = articles.length;
    const publishedCount = articles.filter(a => a.isPublished).length;
    const draftCount = articles.filter(a => !a.isPublished).length;
    
    // Topics count
    const topicsSet = new Set(articles.map(a => a.topic || 'Umum').filter(Boolean));
    const topicCount = topicsSet.size;

    return { total, publishedCount, draftCount, topicCount };
  }, [articles]);

  // Filter & Sort Logic
  const filteredArticles = useMemo(() => {
    return articles
      .filter((a) => {
        if (selectedTab === 'PUBLISHED' && !a.isPublished) return false;
        if (selectedTab === 'DRAFT' && a.isPublished) return false;

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchesTitle = a.title.toLowerCase().includes(term);
          const matchesSlug = a.slug.toLowerCase().includes(term);
          const matchesTopic = a.topic?.toLowerCase().includes(term);
          if (!matchesTitle && !matchesSlug && !matchesTopic) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortOption === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortOption === 'title_asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [articles, selectedTab, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(start, start + itemsPerPage);
  }, [filteredArticles, currentPage, itemsPerPage]);

  // Delete Handler
  const handleOpenDelete = (article: Article) => {
    setDeletingArticle(article);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingArticle) return;

    if (isUsingDummy) {
      setArticles(prev => prev.filter(a => a.id !== deletingArticle.id));
      toast.success('Artikel berhasil dihapus (Mode Preview)');
      setIsDeleteOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteArticle(deletingArticle.id);
      if (res && 'success' in res && res.success) {
        toast.success(locale === 'EN' ? 'Article deleted successfully' : 'Artikel berhasil dihapus');
        setArticles(prev => prev.filter(a => a.id !== deletingArticle.id));
        setIsDeleteOpen(false);
      } else {
        toast.error((res as any)?.error || (locale === 'EN' ? 'Failed to delete article' : 'Gagal menghapus artikel'));
      }
    } catch {
      toast.error(locale === 'EN' ? 'Error deleting article' : 'Terjadi kesalahan saat menghapus artikel');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs">
        <h3 className="font-semibold">Gagal memuat artikel blog</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Preview Mode Notice if DB is empty */}
      {isUsingDummy && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span><strong>Mode Preview Dummy Data:</strong> Belum ada artikel di database. Menampilkan contoh artikel edukasi herbal agar pratinjau layout dapat diuji.</span>
          </div>
          <button 
            onClick={refreshDatabase}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw size={12} /> Cek Ulang Database
          </button>
        </div>
      )}

      {/* 2. Executive Stat Cards (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Total Artikel</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{locale === 'EN' ? 'Published' : 'Dipublikasi'}</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{metrics.publishedCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{locale === 'EN' ? 'Unreleased Drafts' : 'Draf Belum Rilis'}</div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{metrics.draftCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{locale === 'EN' ? 'Topics' : 'Topik / Rubrik'}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.topicCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
        {/* Filter Tabs & Search Header */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
          {/* Tab Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {filterTabs.map((tab) => {
                const active = selectedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'PUBLISHED' && metrics.publishedCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-emerald-700 text-white font-bold">
                        {metrics.publishedCount}
                      </span>
                    )}
                    {tab.id === 'DRAFT' && metrics.draftCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-amber-500 text-white font-bold">
                        {metrics.draftCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Write Article Button */}
            <Link
              href="/admin/articles/form"
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>{t('createNewArticle')}</span>
            </Link>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2.5 border-t border-gray-100">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('searchArticlesPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-8 bg-gray-50/50 border-gray-200 h-9 text-xs rounded-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-green cursor-pointer font-medium"
                >
                  <option value="newest">{t('sortNewest')}</option>
                  <option value="oldest">{t('sortOldest')}</option>
                  <option value="title_asc">A - Z</option>
                </select>
              </div>

              <span className="text-xs text-gray-400">
                Total: <strong className="text-gray-700 font-semibold">{filteredArticles.length}</strong> {t('articles').toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Article Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">{t('articles')}</th>
                <th className="py-3 px-4">{locale === 'EN' ? 'Topic' : 'Topik'}</th>
                <th className="py-3 px-4">{t('status')}</th>
                <th className="py-3 px-4">{locale === 'EN' ? 'Publish Date' : 'Tanggal Rilis'}</th>
                <th className="py-3 px-4 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                    {searchTerm ? (locale === 'EN' ? 'No articles match your search.' : 'Tidak ada artikel yang cocok dengan pencarian.') : (locale === 'EN' ? 'No articles yet.' : 'Belum ada artikel yang ditulis.')}
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => {
                  const image = article.imageUrl || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80';
                  const formattedDate = format(new Date(article.createdAt), "dd MMM yyyy", { locale: dateLocale });

                  return (
                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-lg bg-gray-50 border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={image} alt={article.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <span className="font-bold text-xs text-gray-900 block truncate" title={article.title}>
                              {article.title}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block truncate">
                              /blog/{article.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Topic Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                          <BookOpen size={11} /> {article.topic || (locale === 'EN' ? 'General' : 'Edukasi Herbal')}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {article.isPublished ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-md">
                            <CheckCircle2 size={11} className="text-emerald-600" /> {locale === 'EN' ? 'Published' : 'Dipublikasi'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded-md">
                            <Clock size={11} className="text-amber-600" /> {locale === 'EN' ? 'Draft' : 'Draf'}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/blog/${article.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title={locale === 'EN' ? 'Open in public site' : 'Buka Artikel di Website'}
                          >
                            <ExternalLink size={13} />
                            <span>{t('view')}</span>
                          </Link>

                          <Link
                            href={`/admin/articles/form?id=${article.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title={locale === 'EN' ? 'Edit Article' : 'Edit Artikel'}
                          >
                            <Edit2 size={13} />
                            <span>{t('edit')}</span>
                          </Link>

                          <button
                            onClick={() => handleOpenDelete(article)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title={locale === 'EN' ? 'Delete Article' : 'Hapus Artikel'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredArticles.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {t('showing')} <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredArticles.length)}</span> {t('of')} <span className="font-semibold text-gray-700">{filteredArticles.length}</span> {t('articles').toLowerCase()}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-xs font-semibold text-gray-700 px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={locale === 'EN' ? 'Delete Blog Article' : 'Hapus Artikel Blog'}
        maxWidth="md"
      >
        {deletingArticle && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg leading-relaxed">
              {locale === 'EN' ? (
                <>Are you sure you want to delete <strong className="text-gray-900 font-bold">"{deletingArticle.title}"</strong>?</>
              ) : (
                <>Apakah Anda yakin ingin menghapus artikel <strong className="text-gray-900 font-bold">"{deletingArticle.title}"</strong>?</>
              )}
            </div>
            <p className="text-gray-500 text-[11px]">
              {locale === 'EN' ? 'This action is irreversible. The article will be permanently removed from database and public blog.' : 'Tindakan ini tidak dapat dibatalkan. Artikel akan dihapus secara permanen dari basis data dan blog publik.'}
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isDeleting ? (locale === 'EN' ? 'Deleting...' : 'Menghapus...') : (locale === 'EN' ? 'Yes, Delete Article' : 'Ya, Hapus Artikel')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
