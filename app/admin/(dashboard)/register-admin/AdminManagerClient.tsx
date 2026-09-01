'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Trash2, 
  X, 
  Lock, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { getAdmins, createAdmin, deleteAdmin } from '@/app/actions/admin-management';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN';
  createdAt: string | Date;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: 'SUPERADMIN' | 'ADMIN';
  master_key: string;
}

const INITIAL_FORM_STATE: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'ADMIN',
  master_key: '',
};

export default function AdminManagerClient() {
  const { t, locale } = useAdminLanguage();
  const dateLocale = locale === 'EN' ? enUS : id;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search, Role Filter, and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPERADMIN' | 'ADMIN'>('ALL');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'name_asc'>('newest');

  // Form & Password Security State
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  // Delete Confirmation Modal State
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    const res = await getAdmins();
    if (res.success && res.data) {
      setAdmins(res.data as AdminUser[]);
    } else {
      toast.error(res.error || (locale === 'EN' ? 'Failed to load staff list' : 'Gagal memuat daftar staff admin'));
    }
    setIsLoading(false);
  }, [locale]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Executive Metric Summaries
  const metrics = useMemo(() => {
    const total = admins.length;
    const superAdmins = admins.filter(a => a.role === 'SUPERADMIN').length;
    const standardAdmins = admins.filter(a => a.role === 'ADMIN').length;
    return { total, superAdmins, standardAdmins };
  }, [admins]);

  // Client Filter & Sort Logic
  const filteredAdmins = useMemo(() => {
    return admins
      .filter((admin) => {
        if (roleFilter !== 'ALL' && admin.role !== roleFilter) return false;

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchesName = admin.name.toLowerCase().includes(term);
          const matchesEmail = admin.email.toLowerCase().includes(term);
          if (!matchesName && !matchesEmail) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [admins, roleFilter, searchTerm, sortOption]);

  /**
   * Password strength scoring checks (length, uppercase, digit, special character).
   * SuperAdmin creation requires score >= 4 to satisfy server-side regex validation.
   */
  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]/.test(pass)) score++;

    if (score === 0) {
      setPasswordStrength({ score, text: locale === 'EN' ? 'Very Weak' : 'Sangat Lemah', color: 'bg-red-500' });
    } else if (score <= 2) {
      setPasswordStrength({ score, text: locale === 'EN' ? 'Weak' : 'Lemah', color: 'bg-orange-500' });
    } else if (score === 3) {
      setPasswordStrength({ score, text: locale === 'EN' ? 'Medium' : 'Sedang', color: 'bg-yellow-500' });
    } else {
      setPasswordStrength({ score, text: locale === 'EN' ? 'Strong' : 'Kuat & Aman', color: 'bg-emerald-500' });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, password: val }));
    checkPasswordStrength(val);
  };

  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setPasswordStrength({ score: 0, text: '', color: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordStrength.score < 4) {
      toast.error(locale === 'EN' 
        ? 'Password does not meet security standards!' 
        : 'Password belum memenuhi standar keamanan (Min. 8 Karakter, 1 Huruf Besar, 1 Angka, 1 Simbol)!'
      );
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    form.append('name', formData.name.trim());
    form.append('email', formData.email.trim());
    form.append('password', formData.password);
    form.append('role', formData.role);
    form.append('master_key', formData.master_key.trim());

    const res = await createAdmin(form);
    if (res.success) {
      toast.success(locale === 'EN' ? 'Admin registered successfully' : 'Staff Admin baru berhasil didaftarkan');
      setIsModalOpen(false);
      setFormData(INITIAL_FORM_STATE);
      fetchAdmins();
    } else {
      toast.error(res.error || (locale === 'EN' ? 'Failed to create admin' : 'Gagal membuat admin'));
    }
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAdmin) return;

    setIsDeleting(true);
    const res = await deleteAdmin(deletingAdmin.id);
    if (res.success) {
      toast.success(locale === 'EN' ? 'Admin account removed' : 'Akun admin berhasil dihapus');
      setDeletingAdmin(null);
      fetchAdmins();
    } else {
      toast.error(res.error || (locale === 'EN' ? 'Failed to delete admin' : 'Gagal menghapus admin'));
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('staffList')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">SuperAdmin</div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{metrics.superAdmins}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Staff Admin</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{metrics.standardAdmins}</div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Card (Filter Toolbar & Table) */}
      <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Role Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: locale === 'EN' ? 'All Roles' : 'Semua Role' },
                { id: 'SUPERADMIN', label: 'SuperAdmin' },
                { id: 'ADMIN', label: 'Staff Admin' },
              ].map((tab) => {
                const active = roleFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setRoleFilter(tab.id as any)}
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

            {/* Add Admin Action Button */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus size={15} />
              <span>{t('addAdmin')}</span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2.5 border-t border-gray-100">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={locale === 'EN' ? 'Search admin by name or email...' : 'Cari admin berdasarkan nama/email...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <option value="name_asc">A - Z</option>
                </select>
              </div>

              <span className="text-xs text-gray-400">
                Total: <strong className="text-gray-700 font-semibold">{filteredAdmins.length}</strong> {locale === 'EN' ? 'accounts' : 'akun'}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">{locale === 'EN' ? 'Administrator' : 'Pengguna Admin'}</th>
                <th className="py-3 px-4">{t('role')}</th>
                <th className="py-3 px-4">{t('registeredDate')}</th>
                <th className="py-3 px-4 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-2.5 w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-3 w-28" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 text-xs">
                    {searchTerm 
                      ? (locale === 'EN' ? 'No administrators match your search query.' : 'Tidak ada admin yang cocok dengan pencarian.') 
                      : (locale === 'EN' ? 'No administrators found.' : 'Belum ada akun admin terdaftar.')}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isSuper = admin.role === 'SUPERADMIN';
                  const formattedDate = format(new Date(admin.createdAt), "dd MMM yyyy", { locale: dateLocale });

                  return (
                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                            isSuper 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-gray-900 block">{admin.name}</span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail size={11} /> {admin.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <ShieldAlert size={12} className="text-amber-600" /> SuperAdmin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck size={12} className="text-emerald-600" /> Staff Admin
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setDeletingAdmin(admin)}
                          disabled={isSuper}
                          className={`p-1.5 rounded-md transition-colors ${
                            isSuper
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                          }`}
                          title={isSuper 
                            ? (locale === 'EN' ? 'SuperAdmin accounts cannot be deleted directly.' : 'Akun SuperAdmin tidak dapat dihapus.') 
                            : (locale === 'EN' ? 'Delete admin access' : 'Hapus akses admin')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Add Administrator Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('addAdmin')}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {locale === 'EN' ? 'Full Name' : 'Nama Lengkap'}
            </label>
            <Input 
              placeholder="e.g. Ustadz Ahmad Fauzi" 
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required 
              className="h-9 text-xs rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {t('email')}
            </label>
            <Input 
              type="email" 
              placeholder="admin@alkautsar.com" 
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required 
              className="h-9 text-xs rounded-lg"
            />
          </div>

          {/* Password with Real-time Security Meter */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {locale === 'EN' ? 'Account Password' : 'Kata Sandi Akun'}
            </label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handlePasswordChange}
              required 
              className="h-9 text-xs rounded-lg font-mono"
            />
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(num => (
                    <div 
                      key={num} 
                      className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.score >= num ? passwordStrength.color : 'bg-gray-100'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className={passwordStrength.score < 4 ? 'text-amber-700 font-medium' : 'text-emerald-600 font-bold'}>
                    {passwordStrength.text}
                  </span>
                  <span className="text-gray-400 text-[10px]">
                    Min. 8 char, 1 kapital, 1 angka, 1 simbol
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Role Selection Cards */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5">
              {t('role')}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div 
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  formData.role === 'ADMIN' 
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'ADMIN' }))}
              >
                <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-0.5">
                  <ShieldCheck size={15} className={formData.role === 'ADMIN' ? 'text-emerald-600' : 'text-gray-400'} />
                  <span>Staff Admin</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">
                  {locale === 'EN' ? 'Manage catalog, orders & articles.' : 'Kelola katalog, pesanan & artikel.'}
                </p>
              </div>

              <div 
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  formData.role === 'SUPERADMIN' 
                    ? 'border-amber-600 bg-amber-50/50 shadow-2xs' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'SUPERADMIN' }))}
              >
                <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-0.5">
                  <ShieldAlert size={15} className={formData.role === 'SUPERADMIN' ? 'text-amber-600' : 'text-gray-400'} />
                  <span>SuperAdmin</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">
                  {locale === 'EN' ? 'Full privileges & staff management.' : 'Hak akses penuh & manajemen staff.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sudo Mode / Master Security Key */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
            <label className="flex items-center gap-1 text-gray-800 font-semibold">
              <Key size={13} className="text-amber-600" />
              <span>{locale === 'EN' ? 'SuperAdmin Master PIN (Sudo Mode)' : 'PIN Keamanan Master SuperAdmin'}</span>
            </label>
            <Input 
              type="password" 
              placeholder="••••••" 
              value={formData.master_key}
              onChange={e => setFormData(prev => ({ ...prev, master_key: e.target.value }))}
              required 
              className="h-9 text-xs rounded-lg font-mono bg-white"
            />
            <p className="text-[10px] text-gray-500">
              {locale === 'EN' 
                ? 'Mandatory master security authorization required before registering new accounts.' 
                : 'Verifikasi keamanan wajib sebelum mendaftarkan akun administrator baru.'}
            </p>
          </div>

          {/* Modal Actions */}
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
              disabled={isSubmitting || passwordStrength.score < 4}
              className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('loading') : t('create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingAdmin)}
        onClose={() => setDeletingAdmin(null)}
        title={locale === 'EN' ? 'Revoke Admin Access' : 'Hapus Akses Admin'}
        maxWidth="md"
      >
        {deletingAdmin && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg leading-relaxed">
              {locale === 'EN' ? (
                <>Are you sure you want to revoke admin access for <strong className="text-gray-900 font-bold">"{deletingAdmin.name}"</strong> ({deletingAdmin.email})?</>
              ) : (
                <>Apakah Anda yakin ingin mencabut akses admin untuk <strong className="text-gray-900 font-bold">"{deletingAdmin.name}"</strong> ({deletingAdmin.email})?</>
              )}
            </div>
            <p className="text-gray-500 text-[11px]">
              {locale === 'EN' 
                ? 'This action is irreversible. The account will immediately lose access to all admin portal modules.' 
                : 'Tindakan ini permanen. Pengguna ini akan langsung kehilangan seluruh akses ke dashboard admin.'}
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setDeletingAdmin(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isDeleting ? (locale === 'EN' ? 'Revoking...' : 'Menghapus...') : (locale === 'EN' ? 'Yes, Revoke Access' : 'Ya, Hapus Akses')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
