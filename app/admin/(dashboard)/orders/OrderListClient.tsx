'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAdminOrders, updateOrderStatus } from '@/app/actions/admin-orders';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Edit3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  X,
  Filter,
  RefreshCw,
  ExternalLink,
  Printer,
  MessageCircle,
  PackageCheck,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';
import { Skeleton } from '@/components/ui/Skeleton';

const STATUS_TABS = [
  { id: 'ALL', label: { ID: 'Semua', EN: 'All' } },
  { id: 'PROCESSING', label: { ID: 'Sedang Diproses', EN: 'Processing' } },
  { id: 'PREPARING', label: { ID: 'Sedang Dikemas', EN: 'Preparing' } },
  { id: 'IN_DELIVERY', label: { ID: 'Dalam Pengiriman', EN: 'In Delivery' } },
  { id: 'DELIVERED', label: { ID: 'Terkirim', EN: 'Delivered' } },
  { id: 'COMPLETED', label: { ID: 'Selesai', EN: 'Completed' } },
  { id: 'RETURN_REQUESTED', label: { ID: 'Retur / Klaim', EN: 'Return / Claim' } },
  { id: 'CANCELLED', label: { ID: 'Dibatalkan', EN: 'Cancelled' } },
];

const STATUS_MAP: Record<string, { label: { ID: string; EN: string }; color: any; icon: any }> = {
  WAITING_FOR_PAYMENT: { label: { ID: 'Menunggu Pembayaran', EN: 'Awaiting Payment' }, color: 'default', icon: Clock },
  PAID: { label: { ID: 'Pesanan Baru (Dibayar)', EN: 'Paid (New Order)' }, color: 'warning', icon: Package },
  PROCESSING: { label: { ID: 'Sedang Diproses', EN: 'Processing' }, color: 'info', icon: Package },
  PREPARING: { label: { ID: 'Sedang Dikemas', EN: 'Preparing' }, color: 'purple', icon: Package },
  IN_DELIVERY: { label: { ID: 'Dalam Pengiriman', EN: 'In Delivery' }, color: 'purple', icon: Truck },
  DELIVERED: { label: { ID: 'Terkirim', EN: 'Delivered' }, color: 'success', icon: CheckCircle },
  COMPLETED: { label: { ID: 'Selesai', EN: 'Completed' }, color: 'success', icon: CheckCircle },
  CANCELLED: { label: { ID: 'Dibatalkan', EN: 'Cancelled' }, color: 'error', icon: XCircle },
  RETURN_REQUESTED: { label: { ID: 'Pengajuan Retur', EN: 'Return Requested' }, color: 'warning', icon: AlertCircle },
  RETURNED: { label: { ID: 'Retur Selesai', EN: 'Returned' }, color: 'default', icon: RotateCcw }
};

const COURIER_OPTIONS = [
  'JNE',
  'J&T Express',
  'SiCepat',
  'Anteraja',
  'Pos Indonesia',
  'TIKI',
  'GoSend',
  'GrabExpress',
  'Kurir Internal'
];

interface Order {
  id: string;
  orderId: string | null;
  invoiceId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  paymentType?: string | null;
  voucherCode?: string | null;
  discountAmount?: number | null;
  subtotal?: number | null;
  total: number;
  createdAt: Date | string;
  resi?: string | null;
  courier?: string | null;
  cancellationReason?: string | null;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    count: number;
    imageUrl?: string | null;
  }>;
  shipping?: {
    name?: string | null;
    mobile?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    note?: string | null;
    phone?: string | null;
    recipientName?: string | null;
  } | null;
  user?: {
    name?: string | null;
    email?: string | null;
    mobile?: string | null;
  } | null;
}

interface OrderListClientProps {
  initialOrders?: Order[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

const ITEMS_PER_PAGE = 10;

export default function OrderListClient({
  initialOrders = [],
  initialPagination,
  error
}: OrderListClientProps = {}) {
  const { locale, t } = useAdminLanguage();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [pagination, setPagination] = useState(
    initialPagination || {
      page: 1,
      limit: ITEMS_PER_PAGE,
      total: initialOrders.length,
      totalPages: Math.max(1, Math.ceil(initialOrders.length / ITEMS_PER_PAGE))
    }
  );

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [resi, setResi] = useState('');
  const [courier, setCourier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await getAdminOrders({
        page,
        limit: ITEMS_PER_PAGE,
        status: filterStatus,
        search: search.trim() || undefined
      });

      if (res.success && res.data) {
        setOrders(res.data.orders as Order[]);
        setPagination(res.data.pagination);
      } else {
        toast.error(res.error || (locale === 'EN' ? 'Failed to load orders' : 'Gagal memuat pesanan'));
      }
    } catch (err) {
      toast.error(locale === 'EN' ? 'An error occurred while fetching orders' : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, search, locale]);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    const timer = setTimeout(() => {
      fetchOrders(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders, isInitialMount]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setResi(order.resi || '');
    setCourier(order.courier || '');
    setTargetStatus('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    let nextStatus = targetStatus;
    if (!nextStatus) {
      if (selectedOrder.status === 'PROCESSING') nextStatus = 'PREPARING';
      else if (selectedOrder.status === 'PREPARING') nextStatus = 'IN_DELIVERY';
      else if (selectedOrder.status === 'IN_DELIVERY') nextStatus = 'DELIVERED';
      else if (selectedOrder.status === 'DELIVERED') nextStatus = 'COMPLETED';
      else if (selectedOrder.status === 'RETURN_REQUESTED') nextStatus = 'RETURNED';
    }

    if (!nextStatus) {
      toast.error(locale === 'EN' ? 'Please select the target status' : 'Pilih status tujuan');
      return;
    }

    const isShipping = nextStatus === 'IN_DELIVERY';
    if (isShipping && (!resi.trim() || !courier.trim())) {
      toast.error(locale === 'EN' ? 'Courier and tracking number are required for shipping' : 'Nomor resi dan kurir wajib diisi untuk pengiriman');
      return;
    }

    setIsSubmitting(true);
    /*
     * Kurir dan resi hanya dikirim jika pesanan dialihkan ke pengiriman (IN_DELIVERY).
     * Saat status masih tahap pengemasan (PREPARING) atau sebelumnya, kurir dan resi tidak dikirim
     * agar data tidak tercatat prematur di database.
     */
    const res = await updateOrderStatus(selectedOrder.id, {
      status: nextStatus as any,
      resi: isShipping ? (resi.trim() || undefined) : undefined,
      courier: isShipping ? (courier.trim() || undefined) : undefined
    });

    if (res.success) {
      toast.success(locale === 'EN' ? 'Order status updated successfully' : 'Status pesanan berhasil diperbarui');
      setIsModalOpen(false);
      fetchOrders(pagination.page);
    } else {
      toast.error(res.error || (locale === 'EN' ? 'Failed to update status' : 'Gagal memperbarui status'));
    }
    setIsSubmitting(false);
  };

  const getWhatsAppUrl = (order: Order | null) => {
    if (!order) return null;
    const phone = order.shipping?.phone || order.shipping?.mobile || order.user?.mobile || '';
    if (!phone) return null;

    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const customerName = order.shipping?.recipientName || order.shipping?.name || order.user?.name || (locale === 'EN' ? 'Customer' : 'Pelanggan');
    const orderNumber = order.orderId || order.invoiceId || order.id;

    let message = locale === 'EN'
      ? `Hello ${customerName},\n\nThank you for shopping at Al-Kautsar Herbal Store.\n\nOrder Details #${orderNumber}:`
      : `Halo Kak ${customerName},\n\nTerima kasih telah berbelanja di Toko Herbal Al-Kautsar.\n\nDetail Pesanan #${orderNumber}:`;

    if (order.resi) {
      message += locale === 'EN'
        ? `\n📦 Courier: ${order.courier || 'Courier'}\n🧾 Tracking No: ${order.resi}`
        : `\n📦 Ekspedisi: ${order.courier || 'Kurir'}\n🧾 No. Resi: ${order.resi}`;
    }

    message += locale === 'EN'
      ? `\n💰 Total: Rp ${order.total.toLocaleString('id-ID')}\n\nWe hope our herbal products bring wellness to you and your family. Let us know if you need any assistance!`
      : `\n💰 Total: Rp ${order.total.toLocaleString('id-ID')}\n\nSemoga produk herbal yang dipesan membawa berkah dan kesehatan bagi keluarga. Ada yang bisa kami bantu kembali?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      {/* Dynamic Bilingual Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {locale === 'EN' ? 'Orders List' : 'Daftar Pesanan'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {locale === 'EN' 
            ? 'Manage customer orders, update shipping statuses, and track waybills.' 
            : 'Kelola pesanan pelanggan, perbarui status pengiriman, dan lacak resi.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] mb-8 overflow-hidden">
        
        {/* Tier 1: Modern Segmented Status Tabs (Full Width Bar) */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
            {STATUS_TABS.map((tab) => {
              const isActive = filterStatus === tab.id;
              const tabLabel = tab.label[locale];

              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80 font-bold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {tabLabel}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Search Input & Filter Actions Row */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={locale === 'EN' ? 'Search Order ID, Customer Name, Tracking No...' : 'Cari ID Pesanan, Nama Pelanggan, No. Resi...'}
                className="w-full pl-10 pr-9 py-2 bg-gray-50/70 hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Status / Info & Refresh */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-xs text-gray-500 font-medium">
                {isLoading 
                  ? (locale === 'EN' ? 'Loading data...' : 'Memuat data...') 
                  : (locale === 'EN' ? `Total ${pagination.total} orders` : `Total ${pagination.total} pesanan`)}
              </span>
              <button
                onClick={() => fetchOrders(pagination.page)}
                disabled={isLoading}
                title={t('refresh')}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="overflow-x-auto">
              <Table tableClassName="table-fixed min-w-[800px] w-full">
                <TableHeader>
                  <TableHead className="w-[22%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'ORDER ID' : 'ID PESANAN'}
                  </TableHead>
                  <TableHead className="w-[18%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'DATE' : 'TANGGAL'}
                  </TableHead>
                  <TableHead className="w-[20%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'CUSTOMER' : 'PELANGGAN'}
                  </TableHead>
                  <TableHead className="w-[15%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'TOTAL' : 'TOTAL'}
                  </TableHead>
                  <TableHead className="w-[15%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'STATUS' : 'STATUS'}
                  </TableHead>
                  <TableHead className="w-[10%] text-right text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'ACTION' : 'AKSI'}
                  </TableHead>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-2.5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-2.5 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-2.5 w-36" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-7 w-16 rounded-xl ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                <Package size={28} className="text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-bold text-sm mb-1">
                {locale === 'EN' ? 'No orders found' : 'Tidak ada pesanan ditemukan'}
              </h3>
              <p className="text-gray-500 text-xs max-w-sm">
                {locale === 'EN'
                  ? 'No orders match the selected filter or search keywords.'
                  : 'Tidak ada pesanan yang sesuai dengan filter atau kata kunci pencarian.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table tableClassName="table-fixed min-w-[800px] w-full">
                <TableHeader>
                  <TableHead className="w-[22%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'ORDER ID' : 'ID PESANAN'}
                  </TableHead>
                  <TableHead className="w-[18%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'DATE' : 'TANGGAL'}
                  </TableHead>
                  <TableHead className="w-[20%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'CUSTOMER' : 'PELANGGAN'}
                  </TableHead>
                  <TableHead className="w-[16%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'TOTAL AMOUNT' : 'TOTAL BELANJA'}
                  </TableHead>
                  <TableHead className="w-[14%] text-xs font-semibold text-gray-500">
                    {locale === 'EN' ? 'ORDER STATUS' : 'STATUS PESANAN'}
                  </TableHead>
                  <TableHead className="w-[10%] text-xs font-semibold text-gray-500 text-right">
                    {locale === 'EN' ? 'ACTION' : 'AKSI'}
                  </TableHead>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP['PROCESSING'];
                    const StatusIcon = statusInfo.icon;
                    const statusLabel = statusInfo.label[locale];

                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50/60 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-xs tabular-nums">
                              {order.orderId || order.invoiceId || `#${order.id.slice(0, 8)}`}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">
                              {order.items?.length || 0} {locale === 'EN' ? 'Product Items' : 'Item Produk'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-600 font-medium">
                            {new Date(order.createdAt).toLocaleDateString(locale === 'EN' ? 'en-US' : 'id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 text-xs">
                              {order.customerName || (locale === 'EN' ? 'Customer' : 'Pelanggan')}
                            </span>
                            <span className="text-[11px] text-gray-400 truncate max-w-[180px]">
                              {order.customerEmail || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-900 text-xs tabular-nums">
                            Rp {order.total.toLocaleString('id-ID')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.color} className="flex w-fit items-center gap-1.5 whitespace-nowrap text-[11px] py-0.5 px-2.5 rounded-full">
                            <StatusIcon size={12} />
                            {statusLabel}
                          </Badge>
                          {order.cancellationReason && (
                            <span 
                              className="text-[10px] text-amber-700 font-medium line-clamp-1 max-w-[160px] mt-0.5 cursor-help block"
                              title={order.cancellationReason}
                            >
                              {order.cancellationReason}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {['COMPLETED', 'DELIVERED'].includes(order.status) && (
                              <a
                                href={`/invoice/${order.orderId || order.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200 transition-colors inline-flex items-center"
                                title={t('printInvoice')}
                              >
                                <Printer size={13} />
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openUpdateModal(order)}
                              className="font-semibold text-xs py-1.5 px-3 rounded-xl border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer"
                            >
                              {['PROCESSING', 'PREPARING', 'RETURN_REQUESTED'].includes(order.status) ? (
                                <><Edit3 size={13} className="mr-1.5 text-emerald-600" /> {locale === 'EN' ? 'Process' : 'Proses'}</>
                              ) : (
                                <><Search size={13} className="mr-1.5 text-gray-500" /> {locale === 'EN' ? 'Details' : 'Detail'}</>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">
                {locale === 'EN' 
                  ? `Showing ${orders.length} of total ${pagination.total} orders`
                  : `Menampilkan ${orders.length} dari total ${pagination.total} pesanan`}
              </span>
              <div className="flex gap-1.5 items-center">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-xs font-semibold text-gray-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail & Proses Pesanan */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={locale === 'EN' ? 'Order Details & Processing' : 'Detail & Proses Pesanan'}>
        {selectedOrder && (
          <form onSubmit={handleUpdateStatus} className="space-y-5">
            {/* Ringkasan Status & ID */}
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-gray-200/60">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    {locale === 'EN' ? 'Order ID' : 'ID Pesanan'}
                  </span>
                  <span className="font-bold text-gray-900 text-sm tabular-nums">
                    {selectedOrder.orderId || selectedOrder.invoiceId || `#${selectedOrder.id}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    {locale === 'EN' ? 'Order Status' : 'Status Pesanan'}
                  </span>
                  <Badge variant={STATUS_MAP[selectedOrder.status]?.color || 'default'} className="text-xs py-0.5 px-2.5 rounded-full font-semibold">
                    {STATUS_MAP[selectedOrder.status]?.label[locale] || selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Reason Alert (Cancellation or Complaint) */}
              {selectedOrder.cancellationReason && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  selectedOrder.status === 'RETURN_REQUESTED' || selectedOrder.status === 'RETURNED'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <AlertCircle size={16} className={`shrink-0 mt-0.5 ${
                    selectedOrder.status === 'RETURN_REQUESTED' || selectedOrder.status === 'RETURNED'
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`} />
                  <div>
                    <span className="font-bold block">
                      {selectedOrder.status === 'RETURN_REQUESTED' || selectedOrder.status === 'RETURNED'
                        ? (locale === 'EN' ? 'Return / Complaint Reason:' : 'Alasan Pengajuan Komplain / Retur:')
                        : (locale === 'EN' ? 'Cancellation Reason:' : 'Alasan Pembatalan Pesanan:')}
                    </span>
                    <p className="mt-0.5 leading-relaxed font-medium">
                      {selectedOrder.cancellationReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Data Pelanggan & Alamat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-gray-500 font-medium block">
                    {locale === 'EN' ? 'Customer' : 'Pelanggan'}
                  </span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedOrder.customerName || (locale === 'EN' ? 'Customer' : 'Pelanggan')}
                  </p>
                  <p className="text-gray-500 text-[11px] truncate">
                    {selectedOrder.customerEmail || '-'}
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 font-medium block">
                    {locale === 'EN' ? 'Recipient & Contact' : 'Penerima & Kontak'}
                  </span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedOrder.shipping?.recipientName || selectedOrder.shipping?.name || selectedOrder.customerName || (locale === 'EN' ? 'Recipient' : 'Penerima')}
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    {selectedOrder.shipping?.phone || selectedOrder.shipping?.mobile || '-'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-gray-500 font-medium block">
                    {locale === 'EN' ? 'Shipping Address' : 'Alamat Pengiriman'}
                  </span>
                  <p className="text-gray-800 font-medium mt-0.5 leading-relaxed bg-white p-2.5 rounded-xl border border-gray-200/60">
                    {selectedOrder.shipping?.address
                      ? [
                          selectedOrder.shipping.address,
                          selectedOrder.shipping.city,
                          selectedOrder.shipping.province,
                          selectedOrder.shipping.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')
                      : (locale === 'EN' ? 'Shipping address not specified' : 'Alamat pengiriman belum dicantumkan')}
                  </p>
                  {selectedOrder.shipping?.note && (
                    <p className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg mt-1 border border-amber-100">
                      {locale === 'EN' ? 'Note:' : 'Catatan:'} {selectedOrder.shipping.note}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rincian Produk Dipesan */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Package size={14} className="text-emerald-600" />
                  <span>
                    {locale === 'EN' ? 'Ordered Items' : 'Daftar Produk Dipesan'} ({selectedOrder.items?.length || 0})
                  </span>
                </h4>
                <span className="text-[11px] font-semibold text-gray-400 capitalize">
                  {selectedOrder.paymentType || (locale === 'EN' ? 'Paid' : 'Pembayaran Lunas')}
                </span>
              </div>

              {/* List Item */}
              <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{item.name}</p>
                          <p className="text-[11px] text-gray-500 tabular-nums">
                            Rp {item.price.toLocaleString('id-ID')} × {item.count} pcs
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 tabular-nums shrink-0">
                        Rp {(item.price * item.count).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-gray-400">
                    {locale === 'EN' ? 'No item details for this order.' : 'Tidak ada rincian produk pada pesanan ini.'}
                  </div>
                )}
              </div>

              {/* Rincian Total */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                {selectedOrder.voucherCode && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{locale === 'EN' ? 'Voucher Discount' : 'Diskon Voucher'} ({selectedOrder.voucherCode})</span>
                    <span>- Rp {(selectedOrder.discountAmount || 0).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1">
                  <span>{locale === 'EN' ? 'Total Bill' : 'Total Tagihan'}</span>
                  <span className="text-emerald-700 font-extrabold text-base tabular-nums">
                    Rp {selectedOrder.total.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper / Action Guidance */}
            {selectedOrder.status === 'PROCESSING' && (
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl text-emerald-950 text-xs flex gap-2.5 items-start">
                <PackageCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {locale === 'EN' ? 'Payment Verified & Ready for Packing' : 'Pesanan Telah Dibayar & Siap Dikemas'}
                  </p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    {locale === 'EN' 
                      ? 'Click the button below to mark that warehouse staff is packing this order (Status becomes Preparing).'
                      : 'Klik tombol di bawah untuk menandai bahwa tim gudang sedang mengemas produk ini (Status menjadi Sedang Dikemas).'}
                  </p>
                </div>
              </div>
            )}

            {selectedOrder.status === 'PREPARING' && (
              <div className="space-y-3 p-4 border border-purple-200 bg-purple-50/50 rounded-xl">
                <p className="text-xs font-bold text-purple-900">
                  {locale === 'EN' ? 'Order is being packed. Enter courier & tracking number:' : 'Produk Sedang Dikemas. Masukkan Detail Ekspedisi:'}
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {locale === 'EN' ? 'Courier' : 'Ekspedisi / Kurir'}
                  </label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">{locale === 'EN' ? '-- Select Courier --' : '-- Pilih Ekspedisi / Kurir --'}</option>
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label={locale === 'EN' ? 'Waybill / Tracking Number' : 'Nomor Resi / AWB Pengiriman'}
                  placeholder={locale === 'EN' ? 'Example: JNE1234567890' : 'Contoh: JNE1234567890'}
                  value={resi}
                  onChange={(e) => setResi(e.target.value)}
                  required
                />
              </div>
            )}

            {selectedOrder.status === 'IN_DELIVERY' && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-purple-900 text-xs">
                <p className="font-bold">
                  {locale === 'EN' ? 'Package is in Transit' : 'Paket Sedang Dalam Perjalanan'}
                </p>
                <p className="mt-1">
                  {locale === 'EN' ? 'Courier:' : 'Kurir:'} <b>{selectedOrder.courier}</b> | {locale === 'EN' ? 'Tracking:' : 'Resi:'} <b>{selectedOrder.resi}</b>
                </p>
                <p className="mt-1 text-gray-600">
                  {locale === 'EN'
                    ? 'Once the courier confirms delivery, you can update the status to Delivered.'
                    : 'Jika kurir telah mengkonfirmasi penerimaan paket oleh pembeli, Anda dapat mengubah status ke Terkirim.'}
                </p>
              </div>
            )}

            {selectedOrder.status === 'RETURN_REQUESTED' && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs">
                <p className="font-bold">
                  {locale === 'EN' ? 'Return / Warranty Claim Requested' : 'Pengajuan Retur / Klaim Garansi'}
                </p>
                <p className="mt-1 text-gray-700">
                  {locale === 'EN'
                    ? 'Customer requested a warranty claim. Check unboxing photos/videos on WhatsApp before processing.'
                    : 'Pelanggan telah mengajukan klaim garansi. Periksa bukti foto/video unboxing di WhatsApp Customer Service sebelum memproses.'}
                </p>
              </div>
            )}

            {/* Modal Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              {/* Left Action: Quick Utility (WhatsApp / Print) */}
              <div className="flex items-center gap-2">
                {getWhatsAppUrl(selectedOrder) && (
                  <a
                    href={getWhatsAppUrl(selectedOrder)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors border border-emerald-200"
                    title={locale === 'EN' ? 'Send WhatsApp Notification' : 'Kirim Notifikasi / Chat WhatsApp'}
                  >
                    <MessageCircle size={13} className="text-emerald-600" />
                    <span>{locale === 'EN' ? 'Chat WhatsApp' : 'Chat WA'}</span>
                  </a>
                )}

                {['PROCESSING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status) && (
                  <a
                    href={`/shipping-label/${selectedOrder.orderId || selectedOrder.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors border border-gray-200 shadow-2xs"
                    title={locale === 'EN' ? 'Print Thermal Shipping Label (A6)' : 'Cetak Label Resi Pengiriman (Thermal A6)'}
                  >
                    <Tag size={13} className="text-gray-600" />
                    <span>{locale === 'EN' ? 'Shipping Label' : 'Label Resi'}</span>
                  </a>
                )}

                {['COMPLETED', 'DELIVERED'].includes(selectedOrder.status) && (
                  <a
                    href={`/invoice/${selectedOrder.orderId || selectedOrder.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                  >
                    <Printer size={13} />
                    <span>{t('printInvoice')}</span>
                  </a>
                )}
              </div>

              {/* Right Actions: Dismiss & Primary Action */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="font-semibold text-xs rounded-lg px-3.5 py-2 cursor-pointer"
                >
                  {t('close')}
                </Button>

                {selectedOrder.status === 'PROCESSING' && (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="font-bold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 cursor-pointer shadow-2xs"
                  >
                    {t('startPacking')}
                  </Button>
                )}

                {selectedOrder.status === 'PREPARING' && (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="font-bold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 cursor-pointer shadow-2xs"
                  >
                    {t('shipOrder')}
                  </Button>
                )}

                {selectedOrder.status === 'IN_DELIVERY' && (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="font-bold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 cursor-pointer shadow-2xs"
                  >
                    {t('markDelivered')}
                  </Button>
                )}

                {selectedOrder.status === 'DELIVERED' && (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="font-bold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 cursor-pointer shadow-2xs"
                  >
                    {locale === 'EN' ? 'Complete Order' : 'Selesaikan Pesanan'}
                  </Button>
                )}

                {selectedOrder.status === 'RETURN_REQUESTED' && (
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="font-bold text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 cursor-pointer shadow-2xs"
                  >
                    {locale === 'EN' ? 'Approve Return' : 'Selesaikan Retur'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
