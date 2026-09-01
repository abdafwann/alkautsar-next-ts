'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Wallet, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShoppingBag,
  ArrowUpDown,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getAdminCustomers, toggleCustomerBlockStatus } from '@/app/actions/admin-customers';
import { formatNumber } from '@/lib/format';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Customer } from '@/types/admin';

// Realistic preview data when database has 0 customer records
const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: 'usr-preview-001',
    name: 'Ahmad Fauzi Rahman',
    email: 'ahmad.fauzi@example.com',
    mobile: '081234567890',
    avatar: null,
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    address: 'Jl. Kemang Raya No. 45, RT 02/RW 05',
    isBlocked: false,
    createdAt: '2026-07-15T08:00:00.000Z',
    totalOrders: 12,
    totalSpent: 3850000,
  },
  {
    id: 'usr-preview-002',
    name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@example.com',
    mobile: '085712345678',
    avatar: null,
    province: 'Jawa Barat',
    city: 'Bandung',
    address: 'Jl. Dago Asri No. 12B',
    isBlocked: false,
    createdAt: '2026-07-28T10:30:00.000Z',
    totalOrders: 6,
    totalSpent: 1650000,
  },
  {
    id: 'usr-preview-003',
    name: 'Budi Santoso',
    email: 'budi.santoso99@example.com',
    mobile: '081987654321',
    avatar: null,
    province: 'Jawa Timur',
    city: 'Surabaya',
    address: 'Rungkut Industri III No. 8',
    isBlocked: false,
    createdAt: '2026-08-10T14:15:00.000Z',
    totalOrders: 4,
    totalSpent: 920000,
  },
  {
    id: 'usr-preview-004',
    name: 'Dewi Lestari Putri',
    email: 'dewi.lestari@example.com',
    mobile: '082133445566',
    avatar: null,
    province: 'DI Yogyakarta',
    city: 'Sleman',
    address: 'Jl. Kaliurang KM 7.5',
    isBlocked: false,
    createdAt: '2026-08-20T09:45:00.000Z',
    totalOrders: 2,
    totalSpent: 450000,
  },
  {
    id: 'usr-preview-005',
    name: 'Rian Pratama',
    email: 'rian.pratama.fake@example.com',
    mobile: '087799881122',
    avatar: null,
    province: 'Banten',
    city: 'Tangerang Selatan',
    address: 'BSD City Sektor 1.2',
    isBlocked: true,
    createdAt: '2026-06-30T11:00:00.000Z',
    totalOrders: 1,
    totalSpent: 120000,
  },
  {
    id: 'usr-preview-006',
    name: 'Nadia Safitri',
    email: 'nadia.safitri@example.com',
    mobile: '081344556677',
    avatar: null,
    province: 'Sumatera Utara',
    city: 'Medan',
    address: 'Jl. Setiabudi No. 104',
    isBlocked: false,
    createdAt: '2026-08-01T15:20:00.000Z',
    totalOrders: 8,
    totalSpent: 2450000,
  },
];

export default function CustomerListClient() {
  const { t, locale } = useAdminLanguage();
  const dateLocale = locale === 'EN' ? enUS : id;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDummy, setIsUsingDummy] = useState(false);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'newest' | 'highest_spent' | 'most_orders' | 'name_asc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [blockModalCustomer, setBlockModalCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;

  const statusTabs = useMemo(() => [
    { id: 'ALL', label: t('tabAllCustomers') },
    { id: 'ACTIVE', label: t('tabActiveCustomers') },
    { id: 'BLOCKED', label: t('tabBlockedCustomers') },
    { id: 'SPENDERS', label: locale === 'EN' ? 'Made Purchases' : 'Pernah Belanja' },
    { id: 'NEW_USERS', label: locale === 'EN' ? 'No Orders Yet' : 'Belum Belanja' },
  ], [t, locale]);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    const res = await getAdminCustomers();
    if (res.success && res.data && res.data.length > 0) {
      setCustomers(res.data);
      setIsUsingDummy(false);
    } else {
      // If DB has 0 customers, load realistic preview data
      setCustomers(DUMMY_CUSTOMERS);
      setIsUsingDummy(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Executive Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => !c.isBlocked).length;
    const blocked = customers.filter(c => c.isBlocked).length;
    const totalGMV = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    return { total, active, blocked, totalGMV };
  }, [customers]);

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Tab Filter
        if (selectedStatus === 'ACTIVE' && c.isBlocked) return false;
        if (selectedStatus === 'BLOCKED' && !c.isBlocked) return false;
        if (selectedStatus === 'SPENDERS' && (c.totalOrders === 0 || c.totalSpent === 0)) return false;
        if (selectedStatus === 'NEW_USERS' && c.totalOrders > 0) return false;

        // Search Filter
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          (c.mobile && c.mobile.toLowerCase().includes(term)) ||
          (c.city && c.city.toLowerCase().includes(term)) ||
          (c.province && c.province.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        if (sortOption === 'highest_spent') return (b.totalSpent || 0) - (a.totalSpent || 0);
        if (sortOption === 'most_orders') return (b.totalOrders || 0) - (a.totalOrders || 0);
        if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [customers, selectedStatus, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleToggleBlock = async () => {
    if (!blockModalCustomer) return;

    // Handle dummy preview state safely
    if (isUsingDummy) {
      const newStatus = !blockModalCustomer.isBlocked;
      setCustomers(prev => prev.map(c => c.id === blockModalCustomer.id ? { ...c, isBlocked: newStatus } : c));
      toast.success(newStatus ? 'Akun berhasil diblokir (Preview Mode)' : 'Blokir berhasil dibuka (Preview Mode)');
      setBlockModalCustomer(null);
      if (selectedCustomer?.id === blockModalCustomer.id) {
        setSelectedCustomer(prev => prev ? { ...prev, isBlocked: newStatus } : null);
      }
      return;
    }

    setIsSubmitting(true);
    const newStatus = !blockModalCustomer.isBlocked;
    const res = await toggleCustomerBlockStatus(blockModalCustomer.id, newStatus);
    
    if (res.success) {
      toast.success(newStatus ? 'Akun berhasil diblokir' : 'Blokir akun berhasil dibuka');
      setBlockModalCustomer(null);
      if (selectedCustomer?.id === blockModalCustomer.id) {
        setSelectedCustomer(prev => prev ? { ...prev, isBlocked: newStatus } : null);
      }
      fetchCustomers();
    } else {
      toast.error(res.error || 'Gagal mengubah status akun');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Preview Mode Notice if DB is empty */}
      {isUsingDummy && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span><strong>Mode Preview Dummy Data:</strong> Database belum memiliki pelanggan terdaftar. Menampilkan contoh data pelanggan agar tampilan dapat dipratinjau.</span>
          </div>
          <button 
            onClick={fetchCustomers}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw size={12} /> Cek Ulang Database
          </button>
        </div>
      )}

      {/* 2. Executive Stat Cards (Crisp & Restrained) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalCustomers')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('activeCustomers')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.active}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('blockedCustomers')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.blocked}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalCustomerSpend')}</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              Rp {formatNumber(metrics.totalGMV)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
        {/* Filter Tabs & Search Header */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {statusTabs.map((tab) => {
              const active = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedStatus(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-gray-100">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('searchCustomersPlaceholder')}
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
                  <option value="newest">{t('sortCustomerNewest')}</option>
                  <option value="highest_spent">{t('sortCustomerSpentDesc')}</option>
                  <option value="most_orders">{t('sortCustomerOrdersDesc')}</option>
                  <option value="name_asc">A - Z</option>
                </select>
              </div>

              <span className="text-xs text-gray-400">
                Total: <strong className="text-gray-700 font-semibold">{filteredCustomers.length}</strong> {t('customer').toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">{t('customer')}</th>
                <th className="py-3 px-4">{t('registeredDate')}</th>
                <th className="py-3 px-4">{t('orders')}</th>
                <th className="py-3 px-4">{t('totalAmount')}</th>
                <th className="py-3 px-4">{t('status')}</th>
                <th className="py-3 px-4 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-md shrink-0" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-2.5 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-2.5 w-16" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-3 w-12" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Skeleton className="h-6 w-14 rounded-md" />
                        <Skeleton className="h-6 w-14 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    {searchTerm ? 'Tidak ada pelanggan yang sesuai dengan kata kunci pencarian.' : 'Belum ada data pelanggan.'}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Customer Identity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                          ) : (
                            customer.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-gray-900">{customer.name}</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Mail size={10} /> {customer.email}
                          </div>
                          {customer.mobile && (
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                              <Phone size={9} /> {customer.mobile}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-xs text-gray-700 font-medium">
                        {format(new Date(customer.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {customer.city ? `${customer.city}` : 'Indonesia'}
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-xs text-gray-900">{customer.totalOrders}</span>{' '}
                      <span className="text-[11px] text-gray-500">{t('orders')}</span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-xs text-emerald-600 font-mono">
                        Rp {formatNumber(customer.totalSpent)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {customer.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <ShieldAlert size={11} /> {t('tabBlockedCustomers')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={11} /> {t('tabActiveCustomers')}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title={t('details')}
                        >
                          <Eye size={13} />
                          <span>{t('details')}</span>
                        </button>
                        
                        <button
                          onClick={() => setBlockModalCustomer(customer)}
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                            customer.isBlocked
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                          }`}
                        >
                          {customer.isBlocked ? t('unblockCustomer') : t('blockCustomer')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCustomers.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {t('showing')} <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> {t('of')} <span className="font-semibold text-gray-700">{filteredCustomers.length}</span> {t('customer').toLowerCase()}
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

      {/* 4. Customer Detail Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={t('customerDetailTitle')}
        maxWidth="lg"
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs">
            {/* Header Profile Box */}
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-gray-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {selectedCustomer.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{selectedCustomer.name}</h4>
                  {selectedCustomer.isBlocked ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">{t('tabBlockedCustomers')}</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700">{t('tabActiveCustomers')}</span>
                  )}
                </div>
                <div className="text-gray-500 flex items-center gap-1.5 mt-1">
                  <Mail size={12} /> {selectedCustomer.email}
                </div>
                {selectedCustomer.mobile && (
                  <div className="text-gray-500 flex items-center gap-1.5 mt-0.5 font-mono">
                    <Phone size={12} /> {selectedCustomer.mobile}
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-400 font-medium mb-1">
                  <ShoppingBag size={14} />
                  <span>{t('totalOrdersCount')}</span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {selectedCustomer.totalOrders} <span className="text-xs font-normal text-gray-500">{t('orders')}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-400 font-medium mb-1">
                  <Wallet size={14} />
                  <span>{t('totalSpendAmount')}</span>
                </div>
                <div className="text-base font-bold text-emerald-600 font-mono">
                  Rp {formatNumber(selectedCustomer.totalSpent)}
                </div>
              </div>
            </div>

            {/* Address & Metadata */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-gray-700 block">{t('contactAndAddress')}:</span>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">
                    {selectedCustomer.address || (locale === 'EN' ? 'No primary address recorded.' : 'Belum mengisi alamat domisili.')}
                  </p>
                  {(selectedCustomer.city || selectedCustomer.province) && (
                    <span className="text-gray-400 text-[11px] block mt-0.5">
                      {[selectedCustomer.city, selectedCustomer.province].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-500">
                  {t('registeredDate')}: <strong className="text-gray-800">{format(new Date(selectedCustomer.createdAt), "dd MMMM yyyy", { locale: dateLocale })}</strong>
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <button
                onClick={() => {
                  setBlockModalCustomer(selectedCustomer);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedCustomer.isBlocked
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                }`}
              >
                {selectedCustomer.isBlocked ? t('unblockCustomer') : t('blockCustomer')}
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Block / Unblock Confirmation Modal */}
      <Modal
        isOpen={Boolean(blockModalCustomer)}
        onClose={() => setBlockModalCustomer(null)}
        title={blockModalCustomer?.isBlocked ? t('unblockCustomerConfirmTitle') : t('blockCustomerConfirmTitle')}
        maxWidth="md"
      >
        {blockModalCustomer && (
          <div className="space-y-4 text-xs">
            <div className={`p-3 rounded-lg border ${
              blockModalCustomer.isBlocked 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="leading-relaxed">
                {blockModalCustomer.isBlocked
                  ? `${t('unblockCustomerDesc')} (${blockModalCustomer.name})`
                  : `${t('blockCustomerDesc')} (${blockModalCustomer.name})`}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('customer')}:</span>
                <span className="font-semibold text-gray-900">{blockModalCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-semibold text-gray-900">{blockModalCustomer.email}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setBlockModalCustomer(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleToggleBlock}
                disabled={isSubmitting}
                className={`px-3.5 py-1.5 rounded-lg text-white font-semibold cursor-pointer transition-colors ${
                  blockModalCustomer.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? t('loading') : blockModalCustomer.isBlocked ? t('unblockCustomer') : t('blockCustomer')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
