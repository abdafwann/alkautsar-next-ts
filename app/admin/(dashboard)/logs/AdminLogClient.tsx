'use client';

import { useState, useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  Activity,
  Users,
  Clock,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface AdminLogItem {
  id: string;
  adminId: string;
  action: string;
  entity?: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
  admin: {
    name: string;
    email: string;
    role: string;
  };
}

const CATEGORY_TABS = [
  { id: 'ALL', label: 'Semua' },
  { id: 'AUTH', label: 'Login & Sesi' },
  { id: 'CATALOG', label: 'Katalog & Produk' },
  { id: 'ORDER', label: 'Pesanan' },
  { id: 'PROMO', label: 'Voucher & Promo' },
  { id: 'SYSTEM', label: 'Pengaturan & Sistem' },
] as const;

export default function AdminLogClient({ 
  initialData, 
  error 
}: { 
  initialData?: AdminLogItem[]; 
  error?: string; 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AdminLogItem | null>(null);
  
  const itemsPerPage = 12;

  const logs = useMemo(() => initialData || [], [initialData]);

  // Metric summaries
  const metrics = useMemo(() => {
    const total = logs.length;
    const uniqueAdmins = new Set(logs.map(l => l.adminId || l.admin?.email)).size;
    const todayCount = logs.filter(l => isToday(new Date(l.createdAt))).length;
    
    const entityCounts: Record<string, number> = {};
    logs.forEach(l => {
      const ent = (l.entity || 'system').toUpperCase();
      entityCounts[ent] = (entityCounts[ent] || 0) + 1;
    });
    const topEntity = Object.entries(entityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'SYSTEM';

    return { total, uniqueAdmins, todayCount, topEntity };
  }, [logs]);

  // Filtering & Sorting
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (selectedCategory !== 'ALL') {
          const actionUpper = log.action.toUpperCase();
          const entityUpper = (log.entity || '').toUpperCase();
          
          if (selectedCategory === 'AUTH') {
            if (!actionUpper.includes('LOGIN') && !actionUpper.includes('LOGOUT') && !actionUpper.includes('AUTH')) return false;
          } else if (selectedCategory === 'CATALOG') {
            if (!actionUpper.includes('PRODUCT') && !actionUpper.includes('CATEGORY') && !actionUpper.includes('ARTICLE') && !entityUpper.includes('PRODUCT')) return false;
          } else if (selectedCategory === 'ORDER') {
            if (!actionUpper.includes('ORDER') && !actionUpper.includes('PAYMENT') && !entityUpper.includes('ORDER')) return false;
          } else if (selectedCategory === 'PROMO') {
            if (!actionUpper.includes('VOUCHER') && !actionUpper.includes('PROMO') && !entityUpper.includes('VOUCHER')) return false;
          } else if (selectedCategory === 'SYSTEM') {
            if (!actionUpper.includes('SETTING') && !actionUpper.includes('BANNER') && !entityUpper.includes('SYSTEM')) return false;
          }
        }

        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          log.action.toLowerCase().includes(term) ||
          (log.entity && log.entity.toLowerCase().includes(term)) ||
          (log.details && log.details.toLowerCase().includes(term)) ||
          (log.admin?.name && log.admin.name.toLowerCase().includes(term)) ||
          (log.admin?.email && log.admin.email.toLowerCase().includes(term)) ||
          (log.ipAddress && log.ipAddress.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, selectedCategory, searchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const getActionBadgeClass = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (act.includes('CREATE') || act.includes('TAMBAH') || act.includes('REGISTER')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('UPDATE') || act.includes('UBAH') || act.includes('EDIT')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (act.includes('DELETE') || act.includes('HAPUS') || act.includes('BLOCK')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (act.includes('VOUCHER') || act.includes('PROMO')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
        <h3 className="font-semibold text-sm">Gagal memuat log aktivitas</h3>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Total Log</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Admin Terlibat</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.uniqueAdmins}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Hari Ini</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.todayCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Modul Terbanyak</div>
            <div className="text-base font-bold text-gray-900 mt-0.5 uppercase truncate max-w-[120px]">
              {metrics.topEntity}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
        {/* Filter Tabs & Search Header */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_TABS.map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
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
                placeholder="Cari aksi, detail, nama admin, IP..."
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
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ArrowUpDown size={14} className="text-gray-400" />
                <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
              </button>

              <span className="text-xs text-gray-400">
                Total: <strong className="text-gray-700 font-semibold">{filteredLogs.length}</strong> log
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Entitas & Rincian</th>
                <th className="py-3 px-4 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                    {searchTerm ? 'Tidak ada log yang sesuai dengan pencarian.' : 'Belum ada log aktivitas.'}
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isSuper = log.admin?.role === 'SUPERADMIN';
                  const badgeClass = getActionBadgeClass(log.action);

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap" suppressHydrationWarning>
                        <div className="font-medium text-xs text-gray-900" suppressHydrationWarning>
                          {format(new Date(log.createdAt), "dd MMM yyyy", { locale: id })}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono" suppressHydrationWarning>
                          {format(new Date(log.createdAt), "HH:mm:ss 'WIB'")}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
                            {log.admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-gray-900">{log.admin?.name || 'Admin'}</span>
                              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                                isSuper ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {isSuper ? 'SUPER' : 'STAFF'}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400">{log.admin?.email || '-'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${badgeClass}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs md:max-w-md">
                        <div className="flex items-center gap-2 mb-0.5">
                          {log.entity && (
                            <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                              {log.entity}
                            </span>
                          )}
                          {log.entityId && (
                            <span className="text-[10px] font-mono text-gray-400 truncate max-w-[100px]">
                              #{log.entityId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {log.details || '-'}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Rincian</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between" suppressHydrationWarning>
            <p className="text-xs text-gray-400">
              Menampilkan <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> dari <span className="font-semibold text-gray-700">{filteredLogs.length}</span> log
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={Boolean(currentPage <= 1)}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                suppressHydrationWarning
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-xs font-semibold text-gray-700 px-2" suppressHydrationWarning>
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={Boolean(currentPage >= totalPages)}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                suppressHydrationWarning
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Detail Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Detail Aktivitas Admin"
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Pelaksana</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">{selectedLog.admin?.name}</span>
                <span className="text-gray-500">{selectedLog.admin?.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Waktu</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {format(new Date(selectedLog.createdAt), "dd MMMM yyyy, HH:mm:ss", { locale: id })} WIB
                </span>
                <span className="text-emerald-600 font-medium">Server Recorded</span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block mb-1">Aksi & Modul</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-gray-900 text-white font-semibold">
                  {selectedLog.action}
                </span>
                {selectedLog.entity && (
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold uppercase">
                    {selectedLog.entity}
                  </span>
                )}
                {selectedLog.entityId && (
                  <span className="font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                    ID: {selectedLog.entityId}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block mb-1">Rincian / Payload</span>
              <div className="p-3 bg-gray-900 text-gray-100 font-mono rounded-lg leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedLog.details || 'Tidak ada detail teks.'}
              </div>
            </div>

            {(selectedLog.ipAddress || selectedLog.userAgent) && (
              <div className="pt-2 border-t border-gray-100 text-gray-500 space-y-1">
                {selectedLog.ipAddress && (
                  <div>IP Address: <strong className="font-mono text-gray-800">{selectedLog.ipAddress}</strong></div>
                )}
                {selectedLog.userAgent && (
                  <div className="truncate">User Agent: {selectedLog.userAgent}</div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
