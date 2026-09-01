'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  X, 
  Layers, 
  Package, 
  Sparkles, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  Eye, 
  ExternalLink, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Tag
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { createCategory, updateCategory, deleteCategory, getCategories, getProductsByCategory } from '@/app/actions/catalog';
import { formatCurrency } from '@/lib/format';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';
import type { Category, Product } from '@/types/admin';

interface CategoryManagerProps {
  initialCategories: Category[];
  error?: string;
}

const DUMMY_CATEGORIES: Category[] = [
  { id: 'cat-preview-001', name: 'Habbatussauda & Jintan Hitam', _count: { products: 8 } },
  { id: 'cat-preview-002', name: 'Madu Murni & Propolis Herbal', _count: { products: 14 } },
  { id: 'cat-preview-003', name: 'Minyak Zaitun Extra Virgin', _count: { products: 6 } },
  { id: 'cat-preview-004', name: 'Kapsul & Ekstrak Daun Bidara', _count: { products: 11 } },
  { id: 'cat-preview-005', name: 'Sari Kurma & Herbal Anak', _count: { products: 5 } },
  { id: 'cat-preview-006', name: 'Herbal Teh & Minuman Sehat', _count: { products: 0 } },
];

export default function CategoryManager({ initialCategories, error }: CategoryManagerProps) {
  const { t } = useAdminLanguage();
  const [categories, setCategories] = useState<Category[]>(
    initialCategories && initialCategories.length > 0 ? initialCategories : DUMMY_CATEGORIES
  );
  const [isUsingDummy, setIsUsingDummy] = useState(
    !initialCategories || initialCategories.length === 0
  );

  const filterTabs = useMemo(() => [
    { id: 'ALL', label: t('tabAllCategories') },
    { id: 'HAS_PRODUCTS', label: t('tabHasProducts') },
    { id: 'EMPTY', label: t('tabEmptyProducts') },
  ], [t]);

  // Filters & State
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'name_asc' | 'products_desc' | 'products_asc'>('name_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // View Category Products Modal State
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Refresh DB data
  const refreshDatabase = useCallback(async () => {
    try {
      const res = await getCategories();
      if (res.success && res.data && res.data.length > 0) {
        setCategories(res.data as Category[]);
        setIsUsingDummy(false);
        toast.success(`Berhasil sinkronisasi: ${res.data.length} kategori termuat dari database.`);
      } else {
        toast('Database masih kosong. Tetap menampilkan preview data dummy.', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Gagal menghubungi database.');
    }
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = categories.length;
    const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);
    const emptyCount = categories.filter(c => (c._count?.products || 0) === 0).length;
    
    // Top category with most products
    const sortedByProducts = [...categories].sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0));
    const topCategory = sortedByProducts[0]?._count?.products && sortedByProducts[0]._count.products > 0
      ? sortedByProducts[0].name
      : '-';

    return { total, totalProducts, emptyCount, topCategory };
  }, [categories]);

  // Filter & Sort Logic
  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        const prodCount = c._count?.products || 0;
        if (selectedTab === 'HAS_PRODUCTS' && prodCount === 0) return false;
        if (selectedTab === 'EMPTY' && prodCount > 0) return false;

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          if (!c.name.toLowerCase().includes(term)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aCount = a._count?.products || 0;
        const bCount = b._count?.products || 0;
        if (sortOption === 'products_desc') return bCount - aCount;
        if (sortOption === 'products_asc') return aCount - bCount;
        if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [categories, selectedTab, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // --- Handlers ---
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const handleOpenProductsModal = async (category: Category) => {
    setViewingCategory(category);
    setIsProductsModalOpen(true);
    setIsLoadingProducts(true);

    if (isUsingDummy) {
      // Mock dummy products for category preview
      setCategoryProducts([
        {
          id: `prod-mock-1`,
          title: `Produk Contoh 1 (${category.name})`,
          slug: `produk-contoh-1`,
          price: 75000,
          quantity: 20,
          category: { id: category.id, name: category.name },
          images: [{ publicId: 'img-mock', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=100&auto=format&fit=crop&q=80' }]
        },
        {
          id: `prod-mock-2`,
          title: `Produk Contoh 2 (${category.name})`,
          slug: `produk-contoh-2`,
          price: 110000,
          quantity: 8,
          category: { id: category.id, name: category.name },
          images: [{ publicId: 'img-mock', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80' }]
        }
      ]);
      setIsLoadingProducts(false);
      return;
    }

    try {
      const res = await getProductsByCategory(category.id);
      if (res.success && res.data) {
        setCategoryProducts(res.data as Product[]);
      } else {
        toast.error('Gagal mengambil daftar produk');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat produk');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }

    if (isUsingDummy) {
      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name } : c));
        toast.success('Kategori berhasil diperbarui (Mode Preview)');
      } else {
        const newCat: Category = {
          id: `cat-preview-${Date.now()}`,
          name,
          _count: { products: 0 }
        };
        setCategories(prev => [newCat, ...prev]);
        toast.success('Kategori baru berhasil ditambahkan (Mode Preview)');
      }
      setIsModalOpen(false);
      return;
    }

    setIsFormLoading(true);
    const formData = new FormData();
    formData.append('name', name);

    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, formData);
        if (res.success && res.data) {
          const updated = res.data as Category;
          toast.success('Kategori berhasil diperbarui');
          setCategories(prev => prev.map(c => c.id === updated.id ? { ...c, name: updated.name } : c));
          setIsModalOpen(false);
        } else {
          toast.error(res.error || 'Gagal memperbarui kategori');
        }
      } else {
        const res = await createCategory(formData);
        if (res.success && res.data) {
          const created = res.data as Category;
          toast.success('Kategori baru berhasil ditambahkan');
          setCategories(prev => [{ ...created, _count: { products: 0 } }, ...prev]);
          setIsModalOpen(false);
        } else {
          toast.error(res.error || 'Gagal menambahkan kategori');
        }
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat menyimpan kategori');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    if (isUsingDummy) {
      setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
      toast.success('Kategori berhasil dihapus (Mode Preview)');
      setIsDeleteOpen(false);
      return;
    }

    setIsDeleteLoading(true);
    try {
      const res = await deleteCategory(deletingCategory.id);
      if (res.success) {
        toast.success('Kategori berhasil dihapus');
        setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
        setIsDeleteOpen(false);
      } else {
        toast.error(res.error || 'Gagal menghapus kategori (pastikan tidak ada produk terkait)');
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat menghapus kategori');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs">
        <h3 className="font-semibold">Gagal memuat kategori produk</h3>
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
            <span><strong>Mode Preview Dummy Data:</strong> Belum ada kategori di database. Menampilkan contoh kategori produk agar pratinjau layout dapat diuji.</span>
          </div>
          <button 
            onClick={refreshDatabase}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw size={12} /> Cek Ulang Database
          </button>
        </div>
      )}

      {/* 2. Executive Stat Cards (Crisp & Restrained) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalCategories')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalLinkedProducts')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.totalProducts}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('categoriesWithProducts')}</div>
            <div className="text-xs font-bold text-gray-900 mt-1 truncate max-w-[130px]" title={metrics.topCategory}>
              {metrics.topCategory}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('emptyCategories')}</div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{metrics.emptyCount}</div>
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
                    {tab.id === 'EMPTY' && metrics.emptyCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-amber-500 text-white font-bold">
                        {metrics.emptyCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Add Category Button */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>{t('createNewCategory')}</span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2.5 border-t border-gray-100">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('searchCategoriesPlaceholder')}
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
                  <option value="name_asc">{t('sortCategoryNameAsc')}</option>
                  <option value="products_desc">{t('sortCategoryProductsDesc')}</option>
                  <option value="products_asc">{t('sortCategoryProductsAsc')}</option>
                </select>
              </div>

              <span className="text-xs text-gray-400">
                Total: <strong className="text-gray-700 font-semibold">{filteredCategories.length}</strong> {t('items')}
              </span>
            </div>
          </div>
        </div>

        {/* Category Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">{t('categoryAndSlug')}</th>
                <th className="py-3 px-4">{t('productCount')}</th>
                <th className="py-3 px-4 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400 text-xs">
                    {searchTerm ? 'Tidak ada kategori yang cocok dengan kata kunci pencarian.' : 'Belum ada kategori yang terdaftar.'}
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => {
                  const productCount = category._count?.products || 0;

                  return (
                    <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Category Name */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 border border-gray-200/80">
                            <Tag size={15} />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-gray-900 block">{category.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: #{category.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Products Count Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenProductsModal(category)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                            productCount > 0
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200'
                          }`}
                          title="Klik untuk melihat daftar produk"
                        >
                          <Package size={13} />
                          <span>{productCount} Produk</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenProductsModal(category)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title={t('viewProducts')}
                          >
                            <Eye size={13} />
                            <span>{t('viewProducts')}</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(category)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title={t('edit')}
                          >
                            <Edit2 size={13} />
                            <span>{t('edit')}</span>
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(category)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title={t('delete')}
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
        {filteredCategories.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {t('showing')} <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> {t('of')} <span className="font-semibold text-gray-700">{filteredCategories.length}</span> {t('items')}
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

      {/* 4. Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t('modalEditCategoryTitle') : t('modalAddCategoryTitle')}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {t('categoryNameLabel')}
            </label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder={t('categoryNamePlaceholder')}
              className="h-9 text-xs rounded-lg"
              required
              autoFocus
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isFormLoading || !categoryName.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              {isFormLoading ? t('loading') : editingCategory ? t('save') : t('create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Delete Category Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={t('deleteCategoryConfirmTitle')}
        maxWidth="md"
      >
        {deletingCategory && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg leading-relaxed">
              {t('deleteCategoryDesc')}: <strong className="text-gray-900 font-bold">"{deletingCategory.name}"</strong>
            </div>

            {(deletingCategory._count?.products || 0) > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                <strong>{t('deleteCategoryWarning')}:</strong> Kategori ini memiliki{' '}
                <strong>{deletingCategory._count?.products} {t('products').toLowerCase()}</strong>.
              </div>
            ) : null}

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={isDeleteLoading || (deletingCategory._count?.products || 0) > 0}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleteLoading ? t('loading') : t('delete')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. Products in Category Modal */}
      <Modal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        title={`${t('productsInCategoryTitle')}: ${viewingCategory?.name || ''}`}
        maxWidth="lg"
      >
        <div className="space-y-3 text-xs">
          {isLoadingProducts ? (
            <div className="py-8 text-center text-gray-400">
              <div className="w-4 h-4 border-2 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>{t('loading')}</span>
            </div>
          ) : categoryProducts.length === 0 ? (
            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
              {t('noProductsInCategory')}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
              {categoryProducts.map((product) => {
                const image = product.images?.[0]?.url || 'https://via.placeholder.com/80';
                return (
                  <div key={product.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={image} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate">{product.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-emerald-600 font-semibold">{formatCurrency(product.price)}</span>
                          <span className="text-[10px] text-gray-400 font-mono">Stok: {product.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/admin/products/form?id=${product.id}`}>
                      <button 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors shrink-0 cursor-pointer"
                        title={t('edit')}
                      >
                        <ExternalLink size={14} />
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 flex justify-end border-t border-gray-100">
            <button
              onClick={() => setIsProductsModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
