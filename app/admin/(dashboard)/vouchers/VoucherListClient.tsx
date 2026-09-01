'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Ticket, 
  Search, 
  Trash2, 
  Power, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  LayoutGrid, 
  List as ListIcon, 
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { createVoucher, toggleVoucherStatus, deleteVoucher, getVouchers } from '@/app/actions/admin-vouchers';
import { formatCurrency, formatDate, isExpired } from '@/lib/format';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

interface VoucherFormData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  expiryDate: string;
  usageLimit: string;
}

interface VoucherListClientProps {
  initialVouchers: Voucher[];
  error?: string;
}

const DUMMY_VOUCHERS: Voucher[] = [
  {
    id: 'v-dummy-01',
    code: 'BERKAHKAUTSAR',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 150000,
    maxDiscount: 50000,
    expiryDate: '2026-12-31T23:59:59.000Z',
    usageLimit: 100,
    usedCount: 42,
    isActive: true,
  },
  {
    id: 'v-dummy-02',
    code: 'HERBALHEMAT30',
    discountType: 'FIXED_AMOUNT',
    discountValue: 30000,
    minOrderAmount: 200000,
    maxDiscount: null,
    expiryDate: '2026-11-30T23:59:59.000Z',
    usageLimit: 50,
    usedCount: 18,
    isActive: true,
  },
  {
    id: 'v-dummy-03',
    code: 'FLASHMADU15',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderAmount: 100000,
    maxDiscount: 35000,
    expiryDate: '2026-10-31T23:59:59.000Z',
    usageLimit: 200,
    usedCount: 195,
    isActive: true,
  },
  {
    id: 'v-dummy-04',
    code: 'GRATISONGKIR20',
    discountType: 'FIXED_AMOUNT',
    discountValue: 20000,
    minOrderAmount: 120000,
    maxDiscount: null,
    expiryDate: '2026-01-01T00:00:00.000Z',
    usageLimit: 50,
    usedCount: 50,
    isActive: false,
  },
];

const FILTER_TABS = [
  { id: 'ALL', label: { ID: 'Semua Voucher', EN: 'All Vouchers' } },
  { id: 'ACTIVE', label: { ID: 'Aktif', EN: 'Active' } },
  { id: 'EXPIRED', label: { ID: 'Kedaluwarsa', EN: 'Expired' } },
  { id: 'INACTIVE', label: { ID: 'Nonaktif', EN: 'Inactive' } },
] as const;

export default function VoucherListClient({ initialVouchers, error }: VoucherListClientProps) {
  const { locale, t } = useAdminLanguage();
  const [vouchers, setVouchers] = useState<Voucher[]>(
    initialVouchers && initialVouchers.length > 0 ? initialVouchers : DUMMY_VOUCHERS
  );
  const [isUsingDummy, setIsUsingDummy] = useState(
    !initialVouchers || initialVouchers.length === 0
  );

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'discount_high' | 'expiry_soon'>('newest');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: '',
  });

  // Delete State
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh DB data
  const refreshDatabase = useCallback(async () => {
    try {
      const res = await getVouchers();
      if (res.success && res.data && res.data.length > 0) {
        setVouchers(res.data as Voucher[]);
        setIsUsingDummy(false);
        toast.success(`Berhasil sinkronisasi: ${res.data.length} voucher termuat dari database.`);
      } else {
        toast('Database masih kosong. Tetap menampilkan preview data dummy.', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Gagal menghubungi database.');
    }
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = vouchers.length;
    const activeCount = vouchers.filter(v => v.isActive && !isExpired(v.expiryDate)).length;
    const expiredCount = vouchers.filter(v => isExpired(v.expiryDate)).length;
    const totalUsed = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);
    return { total, activeCount, expiredCount, totalUsed };
  }, [vouchers]);

  // Filter & Sort Logic
  const filteredVouchers = useMemo(() => {
    return vouchers
      .filter((v) => {
        const expired = isExpired(v.expiryDate);
        if (selectedTab === 'ACTIVE' && (!v.isActive || expired)) return false;
        if (selectedTab === 'EXPIRED' && !expired) return false;
        if (selectedTab === 'INACTIVE' && v.isActive) return false;

        if (search.trim()) {
          const term = search.toLowerCase();
          if (!v.code.toLowerCase().includes(term)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
        if (sortOption === 'discount_high') return b.discountValue - a.discountValue;
        if (sortOption === 'expiry_soon') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        return 0;
      });
  }, [vouchers, selectedTab, search, sortOption]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Kode voucher ${code} berhasil disalin!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (id.startsWith('v-dummy-')) {
      setVouchers(prev => prev.map(v => v.id === id ? { ...v, isActive: !currentStatus } : v));
      toast.success(currentStatus ? 'Voucher dinonaktifkan (Preview)' : 'Voucher diaktifkan (Preview)');
      return;
    }

    const original = [...vouchers];
    setVouchers(vouchers.map((v) => (v.id === id ? { ...v, isActive: !currentStatus } : v)));

    const toastId = toast.loading('Mengubah status...');
    const res = await toggleVoucherStatus(id, currentStatus);

    if (res.success) {
      toast.success(currentStatus ? 'Voucher dinonaktifkan' : 'Voucher diaktifkan', { id: toastId });
    } else {
      setVouchers(original);
      toast.error(res.error || 'Gagal mengubah status', { id: toastId });
    }
  };

  const handleOpenDelete = (voucher: Voucher) => {
    setDeletingVoucher(voucher);
  };

  const handleDelete = async () => {
    if (!deletingVoucher) return;

    if (deletingVoucher.id.startsWith('v-dummy-')) {
      setVouchers(prev => prev.filter(v => v.id !== deletingVoucher.id));
      toast.success(`Voucher ${deletingVoucher.code} berhasil dihapus (Mode Preview)`);
      setDeletingVoucher(null);
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading('Menghapus voucher...');
    try {
      const res = await deleteVoucher(deletingVoucher.id);
      if (res.success) {
        toast.success(`Voucher ${deletingVoucher.code} berhasil dihapus dan dicatat di log`, { id: toastId });
        setVouchers(prev => prev.filter(v => v.id !== deletingVoucher.id));
        setDeletingVoucher(null);
      } else {
        toast.error(res.error || 'Gagal menghapus voucher', { id: toastId });
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus voucher', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      setFormError('Kode kupon, nilai diskon, dan tanggal berakhir wajib diisi.');
      return;
    }

    const selectedExpiry = new Date(formData.expiryDate);
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);

    if (isNaN(selectedExpiry.getTime()) || selectedExpiry < todayCheck) {
      setFormError('Tanggal masa berlaku voucher tidak boleh menggunakan tanggal di masa lampau.');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      expiryDate: formData.expiryDate,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
    };

    setIsSubmitting(true);
    try {
      const res = await createVoucher(payload);
      if (res.success && res.data) {
        // If we were using dummy preview, switch to real database list
        if (isUsingDummy) {
          setVouchers([res.data as Voucher]);
          setIsUsingDummy(false);
        } else {
          setVouchers([res.data as Voucher, ...vouchers]);
        }
        toast.success(`Voucher ${payload.code} berhasil diterbitkan dan dicatat di log`);
        setIsModalOpen(false);
        resetForm();
      } else {
        setFormError(res.error || 'Gagal membuat voucher');
      }
    } catch {
      setFormError('Terjadi kesalahan pada server saat membuat voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      expiryDate: '',
      usageLimit: '',
    });
    setFormError('');
  };

  const todayString = new Date().toISOString().split('T')[0];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs">
        <h3 className="font-semibold">Gagal memuat daftar voucher diskon</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {locale === 'EN' ? 'Coupons & Discount Vouchers' : 'Kupon & Voucher Diskon'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {locale === 'EN' 
              ? 'Manage promotional campaigns, coupon codes, quota restrictions, and expiration dates.'
              : 'Atur strategi promosi toko, kode kupon belanja, batasan kuota, dan masa berlaku diskon.'}
          </p>
        </div>
      </div>

      {/* 1. Preview Notice if DB is empty */}
      {isUsingDummy && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>
              <strong>{locale === 'EN' ? 'Demo Mode:' : 'Mode Preview Dummy Data:'}</strong> {locale === 'EN' ? 'No vouchers in database. Displaying sample store vouchers for layout testing.' : 'Database voucher kosong. Menampilkan contoh voucher promosi toko herbal agar pratinjau layout dapat diuji.'}
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

      {/* 2. Executive Stat Cards (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Ticket size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalVouchers')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('activeVouchers')}</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{metrics.activeCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('claimsUsage')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.totalUsed} <span className="text-xs font-normal text-gray-400">{locale === 'EN' ? 'times' : 'kali'}</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('expiredVouchers')}</div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{metrics.expiredCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Header */}
      <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((tab) => {
              const active = selectedTab === tab.id;
              const tabLabel = tab.label[locale];

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tabLabel}
                  {tab.id === 'ACTIVE' && metrics.activeCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-emerald-700 text-white font-bold">
                      {metrics.activeCount}
                    </span>
                  )}
                  {tab.id === 'EXPIRED' && metrics.expiredCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-amber-500 text-white font-bold">
                      {metrics.expiredCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action & View Mode */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-gray-100 p-0.5 rounded-lg flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
                title={locale === 'EN' ? 'Coupon Ticket View' : 'Tampilan Kartu Kupon'}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
                title={locale === 'EN' ? 'Table View' : 'Tampilan Tabel'}
              >
                <ListIcon size={15} />
              </button>
            </div>

            {/* Create Voucher Button */}
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>{locale === 'EN' ? 'Create New Voucher' : 'Buat Voucher Baru'}</span>
            </button>
          </div>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2.5 border-t border-gray-100">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={locale === 'EN' ? 'Search coupon code...' : 'Cari kode kupon voucher...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-gray-50/50 border-gray-200 h-9 text-xs rounded-lg"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
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
                <option value="newest">{locale === 'EN' ? 'Expiration (Newest)' : 'Batas Waktu (Terbaru)'}</option>
                <option value="expiry_soon">{locale === 'EN' ? 'Expiring Soon' : 'Segera Berakhir'}</option>
                <option value="discount_high">{locale === 'EN' ? 'Highest Discount' : 'Nilai Diskon Tertinggi'}</option>
              </select>
            </div>

            <span className="text-xs text-gray-400">
              Total: <strong className="text-gray-700 font-semibold">{filteredVouchers.length}</strong> {locale === 'EN' ? 'vouchers' : 'voucher'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Grid / Table */}
      {filteredVouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200/70 p-6">
          <Ticket size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-gray-900">Tidak ada voucher yang sesuai</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            {search ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada voucher pada kategori ini.'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={14} /> Buat Voucher Sekarang
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Clean Anti-Slop Ticket Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map((voucher) => {
            const expired = isExpired(voucher.expiryDate);
            const usagePercent = voucher.usageLimit 
              ? Math.min(100, Math.round((voucher.usedCount / voucher.usageLimit) * 100))
              : 0;

            return (
              <div 
                key={voucher.id}
                className={`bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col justify-between overflow-hidden ${
                  !voucher.isActive || expired ? 'border-gray-200/70 opacity-75' : 'border-emerald-200/80 ring-1 ring-emerald-500/10'
                }`}
              >
                {/* Card Header & Coupon Value */}
                <div className="p-4 bg-gradient-to-b from-gray-50/60 to-white border-b border-dashed border-gray-200">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Voucher Code Box */}
                    <div className="flex items-center gap-1.5 bg-white border border-gray-300/80 px-2.5 py-1 rounded-md shadow-2xs">
                      <span className="font-mono font-bold text-xs tracking-wider text-gray-900">
                        {voucher.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(voucher.code)}
                        className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 cursor-pointer"
                        title="Salin Kode Kupon"
                      >
                        {copiedCode === voucher.code ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1">
                      {expired ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                          Kedaluwarsa
                        </span>
                      ) : voucher.isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Big Discount Headline */}
                  <div className="mt-1">
                    <div className="text-2xl font-black tracking-tight text-gray-900 flex items-baseline gap-1">
                      {voucher.discountType === 'PERCENTAGE' ? (
                        <>
                          <span>{voucher.discountValue}%</span>
                          <span className="text-xs font-bold text-emerald-700 uppercase">OFF</span>
                        </>
                      ) : (
                        <span>{formatCurrency(voucher.discountValue)}</span>
                      )}
                    </div>
                    {voucher.maxDiscount && voucher.discountType === 'PERCENTAGE' && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Maksimal potongan <strong className="text-gray-700">{formatCurrency(voucher.maxDiscount)}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body: Rules & Quota Progress */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-500">
                      <span>Min. Belanja:</span>
                      <span className="font-semibold text-gray-800">
                        {voucher.minOrderAmount ? formatCurrency(voucher.minOrderAmount) : 'Tanpa Minimum'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-500">
                      <span>Berlaku Hingga:</span>
                      <span className={`font-mono text-[11px] font-semibold ${expired ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatDate(voucher.expiryDate)}
                      </span>
                    </div>

                    {/* Quota Progress */}
                    {voucher.usageLimit ? (
                      <div className="pt-1">
                        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                          <span>Klaim Kuota</span>
                          <span className="font-semibold text-gray-700">{voucher.usedCount} / {voucher.usageLimit}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${usagePercent >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Klaim Terpakai:</span>
                        <span className="font-semibold text-gray-800">{voucher.usedCount} kali (Tanpa Batas Kuota)</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(voucher.id, voucher.isActive)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        voucher.isActive
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <Power size={13} />
                      <span>{voucher.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(voucher)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Voucher"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Enterprise Standard) */
        <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[760px] text-left text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="w-[20%] py-3 px-4">{locale === 'EN' ? 'COUPON CODE' : 'KODE KUPON'}</th>
                  <th className="w-[16%] py-3 px-4">{locale === 'EN' ? 'DISCOUNT VALUE' : 'NILAI DISKON'}</th>
                  <th className="w-[18%] py-3 px-4">{locale === 'EN' ? 'MIN SPEND' : 'SYARAT BELANJA'}</th>
                  <th className="w-[18%] py-3 px-4">{locale === 'EN' ? 'USAGE / QUOTA' : 'PENGGUNAAN / KUOTA'}</th>
                  <th className="w-[18%] py-3 px-4">{locale === 'EN' ? 'STATUS & EXPIRY' : 'STATUS & MASA BERLAKU'}</th>
                  <th className="w-[10%] py-3 px-4 text-right">{locale === 'EN' ? 'ACTION' : 'AKSI'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredVouchers.map((voucher) => {
                  const expired = isExpired(voucher.expiryDate);

                  return (
                    <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Code */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-gray-900">
                          <span>{voucher.code}</span>
                          <button
                            onClick={() => handleCopyCode(voucher.code)}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                            title="Salin"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-xs text-gray-900">
                        {voucher.discountType === 'PERCENTAGE' ? (
                          <span className="text-emerald-700">{voucher.discountValue}% OFF</span>
                        ) : (
                          <span>{formatCurrency(voucher.discountValue)}</span>
                        )}
                      </td>

                      {/* Min spend */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-600">
                        {voucher.minOrderAmount ? formatCurrency(voucher.minOrderAmount) : 'Tanpa Min.'}
                      </td>

                      {/* Usage */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-600">
                        {voucher.usedCount} / {voucher.usageLimit ?? '∞'}
                      </td>

                      {/* Status & Expiry */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div>
                            {expired ? (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                                Kedaluwarsa
                              </span>
                            ) : voucher.isActive ? (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Aktif
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                Nonaktif
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                            s.d. {formatDate(voucher.expiryDate)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggle(voucher.id, voucher.isActive)}
                            className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                            title={voucher.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(voucher)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Create Voucher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Kupon Voucher Baru"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 border border-red-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
              <p>{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Code */}
            <div className="md:col-span-2">
              <Input
                label="Kode Voucher Kupon (Wajib)"
                placeholder="Contoh: BERKAHKAUTSAR50"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                maxLength={20}
                required
                className="font-mono font-bold uppercase tracking-wider"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Hanya huruf kapital dan angka tanpa spasi (maks. 20 karakter).
              </p>
            </div>

            {/* Discount Type */}
            <Select
              label="Tipe Potongan Diskon"
              value={formData.discountType}
              onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
              options={[
                { value: 'PERCENTAGE', label: 'Diskon Persentase (%)' },
                { value: 'FIXED_AMOUNT', label: 'Potongan Nominal Tetap (Rp)' },
              ]}
              required
            />

            {/* Discount Value */}
            <Input
              label={formData.discountType === 'PERCENTAGE' ? 'Besaran Diskon (%)' : 'Nilai Potongan (Rp)'}
              type="number"
              min="1"
              max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
              placeholder={formData.discountType === 'PERCENTAGE' ? 'Contoh: 15' : 'Contoh: 50000'}
              value={formData.discountValue}
              onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
              required
            />

            {/* Min Order Amount */}
            <Input
              label="Minimum Belanja (Rp - Opsional)"
              type="number"
              min="0"
              placeholder="Contoh: 150000 (0 = Tanpa Minimum)"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
            />

            {/* Max Discount Cap (if percentage) */}
            {formData.discountType === 'PERCENTAGE' && (
              <Input
                label="Maksimal Potongan (Rp - Opsional)"
                type="number"
                min="0"
                placeholder="Contoh: 50000"
                value={formData.maxDiscount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
              />
            )}

            {/* Usage Limit */}
            <Input
              label="Batas Kuota Penggunaan (Opsional)"
              type="number"
              min="1"
              placeholder="Contoh: 100 (kosongkan jika tanpa batas)"
              value={formData.usageLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
            />

            {/* Expiry Date */}
            <div className={formData.discountType === 'PERCENTAGE' ? 'md:col-span-2' : 'md:col-span-1'}>
              <Input
                label="Berlaku Sampai Tanggal (Wajib)"
                type="date"
                min={todayString}
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Live Discount Calculation Simulation Box */}
          {formData.discountValue && Number(formData.discountValue) > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Sparkles size={14} className="text-emerald-600" />
                <span>Simulasi Perhitungan Kupon:</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {formData.discountType === 'PERCENTAGE' ? (
                  <>
                    Jika pelanggan berbelanja senilai <strong>{formatCurrency(Number(formData.minOrderAmount) || 100000)}</strong>, maka akan mendapatkan potongan <strong>{formData.discountValue}%</strong>
                    {formData.maxDiscount ? (
                      <> dengan batas maksimal potongan <strong>{formatCurrency(Number(formData.maxDiscount))}</strong>.</>
                    ) : (
                      <> sebesar <strong>{formatCurrency(Math.round(((Number(formData.minOrderAmount) || 100000) * Number(formData.discountValue)) / 100))}</strong>.</>
                    )}
                  </>
                ) : (
                  <>
                    Pelanggan akan langsung mendapatkan potongan harga tetap sebesar <strong>{formatCurrency(Number(formData.discountValue))}</strong>
                    {formData.minOrderAmount ? (
                      <> untuk pesanan minimal <strong>{formatCurrency(Number(formData.minOrderAmount))}</strong>.</>
                    ) : (
                      <> tanpa syarat minimum belanja.</>
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Form Modal Actions */}
          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Terbitkan Voucher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Comprehensive Delete Confirmation Modal with Voucher Details */}
      <Modal
        isOpen={!!deletingVoucher}
        onClose={() => setDeletingVoucher(null)}
        title="Hapus Kupon Voucher"
        maxWidth="md"
      >
        {deletingVoucher && (
          <div className="space-y-4 text-xs">
            {/* Voucher Inspection Summary Card */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Kupon yang Dipilih:</span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                  deletingVoucher.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                }`}>
                  {deletingVoucher.isActive ? 'Status: Aktif' : 'Status: Nonaktif'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-lg shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Ticket size={16} />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-gray-900 tracking-wider">
                      {deletingVoucher.code}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {deletingVoucher.discountType === 'PERCENTAGE' 
                        ? `Diskon ${deletingVoucher.discountValue}% ${deletingVoucher.maxDiscount ? `(Maks. ${formatCurrency(deletingVoucher.maxDiscount)})` : ''}`
                        : `Potongan ${formatCurrency(deletingVoucher.discountValue)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rules & Claims Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
                <div>
                  <span className="text-gray-400 block">Min. Belanja:</span>
                  <span className="font-semibold text-gray-800">
                    {deletingVoucher.minOrderAmount ? formatCurrency(deletingVoucher.minOrderAmount) : 'Tanpa Minimum'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Batas Waktu:</span>
                  <span className="font-mono font-semibold text-gray-800">
                    s.d. {formatDate(deletingVoucher.expiryDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Riwayat Penggunaan:</span>
                  <span className="font-semibold text-gray-800">
                    {deletingVoucher.usedCount} {deletingVoucher.usageLimit ? `/ ${deletingVoucher.usageLimit}` : ''} kali terpakai
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Alert Banner */}
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl leading-relaxed flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-red-900 mb-0.5">Peringatan: Tindakan ini permanen</strong>
                <p className="text-[11px] text-red-700">
                  Kupon voucher ini akan dihapus dari sistem dan kode tidak dapat lagi digunakan oleh pelanggan saat proses checkout.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setDeletingVoucher(null)}
                className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Voucher'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
