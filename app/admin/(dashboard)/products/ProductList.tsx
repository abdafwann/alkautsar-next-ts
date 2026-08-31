'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  X, 
  Package, 
  AlertTriangle, 
  Tag, 
  Layers, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Edit2, 
  Trash2, 
  PackagePlus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Percent 
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { deleteProduct, updateStock, updatePromo, getProducts } from '@/app/actions/catalog';
import { formatCurrency } from '@/lib/format';
import { toast } from 'react-hot-toast';
import type { Product } from '@/types/admin';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

interface ProductListProps {
  initialProducts: Product[];
  error?: string;
}

const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'prod-preview-001',
    title: 'Minyak Habbatussauda Extra Virgin 100ml',
    slug: 'minyak-habbatussauda-extra-virgin-100ml',
    price: 85000,
    quantity: 42,
    productForm: 'Cair / Minyak',
    isFeatured: true,
    isPromo: true,
    promoPercentage: 15,
    promoPrice: 72250,
    promoExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    category: { id: 'cat-1', name: 'Habbatussauda' },
    images: [{ publicId: 'img-1', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=150&auto=format&fit=crop&q=80' }],
  },
  {
    id: 'prod-preview-002',
    title: 'Madu Murni Randu Asli Al-Kautsar 500g',
    slug: 'madu-murni-randu-asli-500g',
    price: 120000,
    quantity: 4, // Stok Kritis (<= 5)
    productForm: 'Cair / Madu',
    isFeatured: true,
    isPromo: false,
    category: { id: 'cat-2', name: 'Madu Herbal' },
    images: [{ publicId: 'img-2', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150&auto=format&fit=crop&q=80' }],
  },
  {
    id: 'prod-preview-003',
    title: 'Kapsul Daun Bidara Arab 60 Kapsul',
    slug: 'kapsul-daun-bidara-arab-60-kapsul',
    price: 65000,
    quantity: 18,
    productForm: 'Kapsul',
    isFeatured: false,
    isPromo: false,
    category: { id: 'cat-3', name: 'Kapsul Herbal' },
    images: [{ publicId: 'img-3', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80' }],
  },
  {
    id: 'prod-preview-004',
    title: 'Minyak Zaitun Tursina Extra Virgin 250ml',
    slug: 'minyak-zaitun-tursina-extra-virgin-250ml',
    price: 95000,
    quantity: 2, // Stok Kritis (<= 5)
    productForm: 'Cair / Minyak',
    isFeatured: false,
    isPromo: true,
    promoPercentage: 10,
    promoPrice: 85500,
    promoExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    category: { id: 'cat-4', name: 'Minyak Zaitun' },
    images: [{ publicId: 'img-4', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=80' }],
  },
  {
    id: 'prod-preview-005',
    title: 'Sari Kurma Angkak Plus Propolis 350g',
    slug: 'sari-kurma-angkak-plus-propolis-350g',
    price: 55000,
    quantity: 29,
    productForm: 'Sirup / Cair',
    isFeatured: true,
    isPromo: false,
    category: { id: 'cat-2', name: 'Madu Herbal' },
    images: [{ publicId: 'img-5', url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=150&auto=format&fit=crop&q=80' }],
  },
];

const FILTER_TABS = [
  { id: 'ALL', label: { ID: 'Semua Produk', EN: 'All Products' } },
  { id: 'LOW_STOCK', label: { ID: 'Stok Kritis (≤ 5)', EN: 'Low Stock (≤ 5)' } },
  { id: 'PROMO', label: { ID: 'Sedang Promo', EN: 'On Promo' } },
  { id: 'FEATURED', label: { ID: 'Produk Unggulan', EN: 'Featured' } },
] as const;

// Helper to accurately determine whether a product promo is actively valid or has expired
export function getPromoStatus(product: {
  isPromo?: boolean | null;
  promoExpiry?: Date | string | null;
  promoPrice?: number | null;
}) {
  if (!product.isPromo) {
    return { isActive: false, isExpired: false, hasPromo: false, expiryDate: null };
  }

  if (product.promoExpiry) {
    const expiry = new Date(product.promoExpiry);
    const now = new Date();
    if (expiry < now) {
      return { isActive: false, isExpired: true, hasPromo: true, expiryDate: expiry };
    }
    return { 
      isActive: Boolean(product.promoPrice && product.promoPrice > 0), 
      isExpired: false, 
      hasPromo: true, 
      expiryDate: expiry 
    };
  }

  return { 
    isActive: Boolean(product.promoPrice && product.promoPrice > 0), 
    isExpired: false, 
    hasPromo: true, 
    expiryDate: null 
  };
}

// Helper to format countdown or validity text for active promo
export function formatPromoExpiryTag(expiryDate: Date | string) {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const formattedDateStr = format(expiry, "dd MMM yyyy", { locale: idLocale });

  if (diffDays <= 0) {
    return {
      text: 'Berakhir hari ini',
      isUrgent: true,
    };
  } else if (diffDays === 1) {
    return {
      text: `Sisa 1 hari (s.d. ${format(expiry, "dd MMM", { locale: idLocale })})`,
      isUrgent: true,
    };
  } else if (diffDays <= 3) {
    return {
      text: `Sisa ${diffDays} hari (s.d. ${format(expiry, "dd MMM", { locale: idLocale })})`,
      isUrgent: true,
    };
  } else {
    return {
      text: `s.d. ${formattedDateStr}`,
      isUrgent: false,
    };
  }
}

export default function ProductList({ initialProducts, error }: ProductListProps) {
  const { locale, t } = useAdminLanguage();
  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : DUMMY_PRODUCTS
  );
  const [isUsingDummy, setIsUsingDummy] = useState(
    !initialProducts || initialProducts.length === 0
  );

  // Filters & State
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'stock_asc' | 'stock_desc' | 'price_asc' | 'price_desc' | 'name_asc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Stock Modal State
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockToAdd, setStockToAdd] = useState('');
  const [isStockLoading, setIsStockLoading] = useState(false);

  // Promo Modal State
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoProduct, setPromoProduct] = useState<Product | null>(null);
  const [promoData, setPromoData] = useState({
    isPromo: false,
    promoPercentage: '',
    promoPrice: '',
    promoExpiry: '',
  });
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Refresh data from DB
  const refreshDatabase = useCallback(async () => {
    try {
      const res = await getProducts();
      if (res.success && res.data && res.data.length > 0) {
        setProducts(res.data as Product[]);
        setIsUsingDummy(false);
        toast.success(`Berhasil sinkronisasi: ${res.data.length} produk termuat dari database.`);
      } else {
        toast('Database masih kosong. Tetap menampilkan preview data dummy.', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Gagal menghubungi database.');
    }
  }, []);

  // Compute Metrics (Accurately checking Promo Expiry)
  const metrics = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter(p => p.quantity <= 5).length;
    const promoCount = products.filter(p => getPromoStatus(p).isActive).length;
    const expiredPromoCount = products.filter(p => getPromoStatus(p).isExpired).length;
    const uniqueCategories = new Set(products.map(p => p.category?.name).filter(Boolean)).size;

    return { total, lowStock, promoCount, expiredPromoCount, uniqueCategories };
  }, [products]);

  // Unique categories and product forms for dropdowns
  const availableCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category?.name).filter(Boolean))) as string[];
  }, [products]);

  const availableForms = useMemo(() => {
    return Array.from(new Set(products.map(p => p.productForm).filter(Boolean))) as string[];
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const promoStatus = getPromoStatus(p);

        // Tab Filter
        if (selectedTab === 'LOW_STOCK' && p.quantity > 5) return false;
        if (selectedTab === 'PROMO' && !promoStatus.isActive) return false;
        if (selectedTab === 'FEATURED' && !p.isFeatured) return false;

        // Category Filter
        if (selectedCategory !== 'ALL' && p.category?.name !== selectedCategory) return false;

        // Form Filter
        if (selectedForm !== 'ALL' && p.productForm !== selectedForm) return false;

        // Search Term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchesTitle = p.title?.toLowerCase().includes(term);
          const matchesSlug = p.slug?.toLowerCase().includes(term);
          const matchesCat = p.category?.name?.toLowerCase().includes(term);
          if (!matchesTitle && !matchesSlug && !matchesCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'stock_asc') return a.quantity - b.quantity;
        if (sortOption === 'stock_desc') return b.quantity - a.quantity;
        if (sortOption === 'price_asc') return a.price - b.price;
        if (sortOption === 'price_desc') return b.price - a.price;
        if (sortOption === 'name_asc') return (a.title || '').localeCompare(b.title || '');
        return 0; // Default order
      });
  }, [products, selectedTab, selectedCategory, selectedForm, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // --- Handlers ---
  const handleOpenStockModal = (product: Product) => {
    setStockProduct(product);
    setStockToAdd('');
    setIsStockOpen(true);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;

    const qty = parseInt(stockToAdd);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Masukkan jumlah stok yang valid (minimal 1)');
      return;
    }

    if (isUsingDummy) {
      setProducts(prev => prev.map(p => p.id === stockProduct.id ? { ...p, quantity: p.quantity + qty } : p));
      toast.success(`Berhasil menambah ${qty} stok (Mode Preview)`);
      setIsStockOpen(false);
      return;
    }

    setIsStockLoading(true);
    try {
      const res = await updateStock(stockProduct.id, qty);
      if (res.success && res.data) {
        toast.success(`Berhasil menambah ${qty} stok ke gudang`);
        setProducts(prev => prev.map(p => p.id === stockProduct.id ? { ...p, quantity: res.data!.newQuantity } : p));
        setIsStockOpen(false);
      } else {
        toast.error(res.error || 'Gagal memperbarui stok');
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat memperbarui stok');
    } finally {
      setIsStockLoading(false);
    }
  };

  const handleOpenPromoModal = (product: Product) => {
    const status = getPromoStatus(product);
    setPromoProduct(product);
    
    // Auto-uncheck "Status Promo Aktif" if promo has expired
    const isCurrentlyActive = status.isActive;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultExpiry = !status.isExpired && product.promoExpiry 
      ? new Date(product.promoExpiry).toISOString().split('T')[0]
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setPromoData({
      isPromo: isCurrentlyActive, // Unchecked if expired!
      promoPercentage: product.promoPercentage?.toString() || '',
      promoPrice: product.promoPrice?.toString() || '',
      promoExpiry: defaultExpiry >= todayStr ? defaultExpiry : todayStr,
    });
    setIsPromoOpen(true);
  };

  const handlePercentageChange = (val: string) => {
    let newPromoPrice = promoData.promoPrice;
    if (promoProduct && val) {
      const perc = parseFloat(val);
      if (!isNaN(perc) && perc > 0 && perc <= 100) {
        newPromoPrice = Math.round(promoProduct.price - (promoProduct.price * perc / 100)).toString();
      }
    }
    setPromoData(prev => ({ ...prev, promoPercentage: val, promoPrice: newPromoPrice }));
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoProduct) return;

    const todayStr = new Date().toISOString().split('T')[0];

    if (promoData.isPromo) {
      if (!promoData.promoPercentage || !promoData.promoExpiry) {
        toast.error('Persentase diskon dan batas tanggal promo wajib diisi jika promo aktif');
        return;
      }
      if (promoData.promoExpiry < todayStr) {
        toast.error('Batas waktu promo tidak boleh di masa lampau');
        return;
      }
    }

    // Set expiration time to 23:59:59 of selected date
    let processedPromoExpiry: string | null = null;
    if (promoData.isPromo && promoData.promoExpiry) {
      const dateObj = new Date(promoData.promoExpiry);
      dateObj.setHours(23, 59, 59, 999);
      processedPromoExpiry = dateObj.toISOString();
    }

    if (isUsingDummy) {
      setProducts(prev => prev.map(p => p.id === promoProduct.id ? {
        ...p,
        isPromo: promoData.isPromo,
        promoPercentage: promoData.isPromo && promoData.promoPercentage ? parseFloat(promoData.promoPercentage) : null,
        promoPrice: promoData.isPromo && promoData.promoPrice ? parseFloat(promoData.promoPrice) : null,
        promoExpiry: promoData.isPromo ? processedPromoExpiry : null,
      } : p));
      toast.success(promoData.isPromo ? 'Pengaturan promo berhasil disimpan (Mode Preview)' : 'Status promo dinonaktifkan (Mode Preview)');
      setIsPromoOpen(false);
      return;
    }

    setIsPromoLoading(true);
    try {
      const res = await updatePromo(promoProduct.id, {
        isPromo: promoData.isPromo,
        promoPercentage: promoData.isPromo && promoData.promoPercentage ? parseFloat(promoData.promoPercentage) : null,
        promoPrice: promoData.isPromo && promoData.promoPrice ? parseFloat(promoData.promoPrice) : null,
        promoExpiry: promoData.isPromo ? processedPromoExpiry : null,
      });

      if (res.success && res.data) {
        toast.success(promoData.isPromo ? 'Pengaturan promo berhasil disimpan' : 'Status promo berhasil dinonaktifkan');
        setProducts(prev => prev.map(p => p.id === promoProduct.id ? {
          ...p,
          isPromo: res.data!.isPromo,
          promoPercentage: res.data!.promoPercentage,
          promoPrice: res.data!.promoPrice,
          promoExpiry: res.data!.promoExpiry,
        } : p));
        setIsPromoOpen(false);
      } else {
        toast.error(res.error || 'Gagal menyimpan promo');
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat menyimpan promo');
    } finally {
      setIsPromoLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    if (isUsingDummy) {
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      toast.success('Produk berhasil dihapus (Mode Preview)');
      setIsDeleteOpen(false);
      return;
    }

    setIsDeleteLoading(true);
    try {
      const res = await deleteProduct(deletingProduct.id);
      if (res.success) {
        toast.success('Produk berhasil dihapus dari katalog');
        setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
        setIsDeleteOpen(false);
      } else {
        toast.error(res.error || 'Gagal menghapus produk');
      }
    } catch {
      toast.error('Terjadi kesalahan sistem saat menghapus produk');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs">
        <h3 className="font-semibold">Gagal memuat katalog produk</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {locale === 'EN' ? 'Product Catalog' : 'Katalog Produk'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {locale === 'EN' 
              ? 'Manage entire herbal inventory, warehouse stock, pricing, and promotional discount campaigns.'
              : 'Kelola seluruh inventaris produk herbal, stok gudang, harga, dan pengaturan promo diskon.'}
          </p>
        </div>
        <Link href="/admin/products/form">
          <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs">
            <Plus size={16} />
            <span>{locale === 'EN' ? 'Add New Product' : 'Tambah Produk Baru'}</span>
          </button>
        </Link>
      </div>

      {/* 1. Preview Mode Notice if DB is empty */}
      {isUsingDummy && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>
              <strong>{locale === 'EN' ? 'Demo Mode:' : 'Mode Preview Dummy Data:'}</strong> {locale === 'EN' ? 'No products in database. Displaying sample herbal products for catalog testing.' : 'Belum ada produk di database. Menampilkan contoh produk herbal agar pratinjau layout katalog dapat diuji.'}
            </span>
          </div>
          <button 
            onClick={refreshDatabase}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw size={12} /> {locale === 'EN' ? 'Check Database' : 'Cek Ulang Database'}
          </button>
        </div>
      )}

      {/* 2. Executive Stat Cards (Crisp & Restrained) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalProducts')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('lowStock')}</div>
            <div className="text-xl font-bold text-red-600 mt-0.5">{metrics.lowStock}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Tag size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('onPromo')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.promoCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalCategories')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.uniqueCategories}</div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
        {/* Filter Tabs & Search Header */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
          {/* Tab Filters */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((tab) => {
              const active = selectedTab === tab.id;
              const tabLabel = tab.label[locale];

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
                  {tabLabel}
                  {tab.id === 'LOW_STOCK' && metrics.lowStock > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-red-500 text-white font-bold">
                      {metrics.lowStock}
                    </span>
                  )}
                  {tab.id === 'PROMO' && metrics.promoCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-amber-500 text-white font-bold">
                      {metrics.promoCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Secondary Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2.5 border-t border-gray-100">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={locale === 'EN' ? 'Search product name, slug, category...' : 'Cari nama produk, slug, kategori...'}
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-green cursor-pointer font-medium"
              >
                <option value="ALL">{locale === 'EN' ? 'All Categories' : 'Semua Kategori'}</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Form Dropdown */}
              <select
                value={selectedForm}
                onChange={(e) => {
                  setSelectedForm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-green cursor-pointer font-medium"
              >
                <option value="ALL">{locale === 'EN' ? 'All Forms' : 'Semua Sediaan'}</option>
                {availableForms.map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-green cursor-pointer font-medium"
                >
                  <option value="newest">{locale === 'EN' ? 'Newest' : 'Terbaru'}</option>
                  <option value="stock_asc">{locale === 'EN' ? 'Lowest Stock' : 'Stok Paling Sedikit'}</option>
                  <option value="stock_desc">{locale === 'EN' ? 'Highest Stock' : 'Stok Terbanyak'}</option>
                  <option value="price_asc">{locale === 'EN' ? 'Lowest Price' : 'Harga Terendah'}</option>
                  <option value="price_desc">{locale === 'EN' ? 'Highest Price' : 'Harga Tertinggi'}</option>
                  <option value="name_asc">{locale === 'EN' ? 'Name (A-Z)' : 'Nama (A-Z)'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[800px] text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="w-[36%] py-3 px-4">{locale === 'EN' ? 'PRODUCT' : 'PRODUK'}</th>
                <th className="w-[20%] py-3 px-4">{locale === 'EN' ? 'CATEGORY & FORM' : 'KATEGORI & SEDIAAN'}</th>
                <th className="w-[18%] py-3 px-4">{locale === 'EN' ? 'UNIT PRICE' : 'HARGA SATUAN'}</th>
                <th className="w-[14%] py-3 px-4">{locale === 'EN' ? 'STOCK' : 'STOK GUDANG'}</th>
                <th className="w-[12%] py-3 px-4 text-right">{locale === 'EN' ? 'OPTIONS' : 'OPSI'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                    {searchTerm ? 'Tidak ada produk yang cocok dengan pencarian.' : 'Belum ada produk yang terdaftar.'}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const image = product.images?.[0]?.url || 'https://via.placeholder.com/80';
                  const formattedPrice = formatCurrency(product.price);
                  const promoStatus = getPromoStatus(product);
                  const formattedPromoPrice = promoStatus.isActive && product.promoPrice
                    ? formatCurrency(product.promoPrice)
                    : null;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Product Thumbnail & Identity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={image} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-gray-900">{product.title}</span>
                              {product.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                                  <Sparkles size={10} /> Unggulan
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Form */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                            <Tag size={11} /> {product.category?.name || 'Umum'}
                          </span>
                          {product.productForm && (
                            <span className="text-[11px] text-gray-500 font-medium bg-gray-50 border border-gray-200/60 px-1.5 py-0.5 rounded-md">
                              {product.productForm}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price & Promo (Active vs Expired vs Normal) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {promoStatus.isActive && formattedPromoPrice ? (
                          <div className="space-y-1">
                            {/* Line 1: Promo Price + Normal Struck-through Price + Discount Pill */}
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-red-600 font-mono">{formattedPromoPrice}</span>
                              <span className="text-[11px] text-gray-400 line-through font-mono">{formattedPrice}</span>
                              {product.promoPercentage && (
                                <span className="px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded-md">
                                  -{product.promoPercentage}%
                                </span>
                              )}
                            </div>
                            {/* Line 2: Countdown or Validity Tag */}
                            {product.promoExpiry && (
                              <div>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                                  formatPromoExpiryTag(product.promoExpiry).isUrgent
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200/60'
                                }`}>
                                  <Clock size={10} className={formatPromoExpiryTag(product.promoExpiry).isUrgent ? 'text-amber-600' : 'text-gray-400'} />
                                  {formatPromoExpiryTag(product.promoExpiry).text}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : promoStatus.isExpired ? (
                          <div className="space-y-1">
                            <span className="font-bold text-xs text-gray-900 font-mono block">{formattedPrice}</span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-medium rounded-md">
                              <Clock size={10} className="text-gray-400" /> Promo Berakhir {product.promoExpiry ? `(${format(new Date(product.promoExpiry), "dd MMM yyyy", { locale: idLocale })})` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-xs text-gray-900 font-mono">{formattedPrice}</span>
                        )}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {product.quantity <= 5 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle size={11} /> {product.quantity} Kritis
                          </span>
                        ) : product.quantity <= 10 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {product.quantity} Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> {product.quantity} Tersedia
                          </span>
                        )}
                      </td>

                      {/* Action Options */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenStockModal(product)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Tambah Stok Gudang"
                          >
                            <PackagePlus size={13} />
                            <span>Stok</span>
                          </button>

                          <button
                            onClick={() => handleOpenPromoModal(product)}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                              product.isPromo 
                                ? 'text-red-700 bg-red-50 hover:bg-red-100' 
                                : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title="Atur Promo / Diskon"
                          >
                            <Tag size={13} />
                            <span>Promo</span>
                          </button>

                          <Link href={`/admin/products/form?id=${product.id}`}>
                            <button
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Edit Data Produk"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                          </Link>

                          <button
                            onClick={() => {
                              setDeletingProduct(product);
                              setIsDeleteOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus Produk"
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
        {filteredProducts.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Menampilkan <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> dari <span className="font-semibold text-gray-700">{filteredProducts.length}</span> produk
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

      {/* 4. Restock Modal */}
      <Modal
        isOpen={isStockOpen}
        onClose={() => setIsStockOpen(false)}
        title="Tambah Stok Masuk Gudang"
        maxWidth="sm"
      >
        {stockProduct && (
          <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Produk</span>
              <h4 className="font-bold text-gray-900 text-sm mt-0.5">{stockProduct.title}</h4>
              <div className="text-gray-500 mt-1 flex items-center justify-between">
                <span>Stok saat ini:</span>
                <strong className="font-mono text-gray-800 text-xs">{stockProduct.quantity} unit</strong>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Jumlah Tambahan Stok Unit
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Contoh: 20"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
                className="h-9 text-xs rounded-lg"
                required
                autoFocus
              />
              <div className="flex gap-1.5 mt-2">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setStockToAdd(preset.toString())}
                    className="flex-1 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsStockOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isStockLoading || !stockToAdd}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isStockLoading ? 'Menyimpan...' : 'Tambah ke Stok'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 5. Promo & Flash Sale Modal */}
      <Modal
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        title="Pengaturan Promo & Diskon"
        maxWidth="md"
      >
        {promoProduct && (
          <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
            {/* Expired Promo Warning Banner if previously expired */}
            {getPromoStatus(promoProduct).isExpired && (
              <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-lg text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Promo Sebelumnya Telah Kadaluarsa:</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Batas waktu promo untuk produk ini telah lewat ({promoProduct.promoExpiry ? format(new Date(promoProduct.promoExpiry), "dd MMMM yyyy", { locale: idLocale }) : 'masa lampau'}) sehingga status promo otomatis dinonaktifkan. Centang <strong>"Status Promo Aktif"</strong> dan pilih tanggal baru untuk mengaktifkan promo kembali.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Produk</span>
                <h4 className="font-bold text-gray-900 text-sm mt-0.5">{promoProduct.title}</h4>
                <div className="text-gray-500 mt-1">
                  Harga Normal: <strong className="font-mono text-gray-800">{formatCurrency(promoProduct.price)}</strong>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={promoData.isPromo}
                  onChange={(e) => setPromoData(prev => ({ ...prev, isPromo: e.target.checked }))}
                  className="w-4 h-4 text-primary-green rounded border-gray-300 focus:ring-primary-green cursor-pointer"
                />
                <span className="font-bold text-gray-900 text-xs">Status Promo Aktif</span>
              </label>
            </div>

            {promoData.isPromo && (
              <div className="space-y-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Persentase Diskon (%)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Contoh: 15"
                        value={promoData.promoPercentage}
                        onChange={(e) => handlePercentageChange(e.target.value)}
                        className="h-9 text-xs rounded-lg pr-7"
                        required
                      />
                      <Percent size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Harga Promo Akhir (Rp)
                    </label>
                    <Input
                      type="number"
                      value={promoData.promoPrice}
                      onChange={(e) => setPromoData(prev => ({ ...prev, promoPrice: e.target.value }))}
                      className="h-9 text-xs rounded-lg font-mono"
                      placeholder="Auto-dihitung"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Batas Waktu Berakhir Promo
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={promoData.promoExpiry}
                      onChange={(e) => setPromoData(prev => ({ ...prev, promoExpiry: e.target.value }))}
                      className="h-9 text-xs rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPromoOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPromoLoading}
                className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isPromoLoading ? 'Menyimpan...' : 'Simpan Promo'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 6. Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Produk"
        maxWidth="md"
      >
        {deletingProduct && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <strong className="text-gray-900 font-bold">"{deletingProduct.title}"</strong> dari katalog? Tindakan ini tidak dapat dibatalkan.
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Harga:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(deletingProduct.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stok tersisa:</span>
                <span className="font-semibold text-gray-900">{deletingProduct.quantity} unit</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleteLoading}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isDeleteLoading ? 'Menghapus...' : 'Ya, Hapus Produk'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
