'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  WarningCircle, 
  MagnifyingGlass, 
  XCircle,
  WarningOctagon,
  CaretDown, 
  CaretUp, 
  MapPin, 
  CreditCard, 
  Printer, 
  Receipt,
  X
} from '@phosphor-icons/react';
import { cancelOrder } from '@/app/actions/order';
import toast from 'react-hot-toast';

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

/**
 * Daftar alasan pembatalan standar e-commerce herbal.
 * Dipisahkan dari komponen agar mudah diuji dan di-maintain.
 */
const CANCEL_REASONS = [
  'Ingin mengubah pesanan / alamat pengiriman',
  'Ingin mengubah metode pembayaran',
  'Menemukan harga lebih murah di tempat lain',
  'Tidak membutuhkan produk ini lagi',
  'Terdapat kesalahan pada pesanan',
] as const;

const REASON_OTHER_KEY = '__other__';

export function OrdersListClient({ initialOrders }: { initialOrders: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNPAID' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('ALL');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [isPayingId, setIsPayingId] = useState<string | null>(null);
  const router = useRouter();

  /* ── Cancel Modal State ── */
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>(CANCEL_REASONS[0]);
  const [cancelReasonOther, setCancelReasonOther] = useState('');
  const isCancelModalOpen = cancelModalOrderId !== null;
  const cancelModalOrder = initialOrders.find(o => o.id === cancelModalOrderId);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleDetails = (orderId: string) => {
    setExpandedDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const selectedOrderForModal = initialOrders.find(o => expandedDetails.has(o.id));
  const isModalOpen = expandedDetails.size > 0;

  const handleCloseModal = () => {
    setExpandedDetails(new Set());
  };

  const handlePay = (snapToken: string, midtransOrderId: string) => {
    if ((window as any).snap) {
      setIsPayingId(midtransOrderId);
      (window as any).snap.pay(snapToken, {
        onSuccess: function () {
          toast.success('Pembayaran berhasil diproses!');
          router.refresh();
        },
        onPending: function () {
          toast.success('Menunggu penyelesaian pembayaran.');
          setIsPayingId(null);
        },
        onError: function () {
          toast.error('Pembayaran gagal atau dibatalkan.');
          setIsPayingId(null);
        },
        onClose: function () {
          toast.error('Jendela pembayaran ditutup.');
          setIsPayingId(null);
        }
      });
    } else {
      toast.error('Sistem pembayaran sedang dimuat, silakan coba beberapa saat lagi.');
    }
  };

  /* ── Cancel Modal Handlers ── */
  const openCancelModal = useCallback((orderId: string) => {
    setCancelModalOrderId(orderId);
    setCancelReason(CANCEL_REASONS[0]);
    setCancelReasonOther('');
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalOrderId(null);
    setCancelReason(CANCEL_REASONS[0]);
    setCancelReasonOther('');
  }, []);

  const confirmCancel = useCallback(async () => {
    if (!cancelModalOrderId) return;

    const finalReason = cancelReason === REASON_OTHER_KEY
      ? (cancelReasonOther.trim() || 'Dibatalkan oleh pembeli')
      : cancelReason;

    setIsCancelling(cancelModalOrderId);
    const res = await cancelOrder(cancelModalOrderId, finalReason);

    if (res.success) {
      toast.success('Pesanan berhasil dibatalkan.');
      closeCancelModal();
      router.refresh();
    } else {
      toast.error(res.error || 'Gagal membatalkan pesanan.');
    }
    setIsCancelling(null);
  }, [cancelModalOrderId, cancelReason, cancelReasonOther, closeCancelModal]);

  /** Disabled when "Lainnya" is chosen but text input is empty */
  const isConfirmDisabled =
    isCancelling === cancelModalOrderId ||
    (cancelReason === REASON_OTHER_KEY && cancelReasonOther.trim().length === 0);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialOrders.filter(order => {
      const searchMatch = !q || 
                          order.orderId?.toLowerCase().includes(q) || 
                          order.invoiceId?.toLowerCase().includes(q) ||
                          order.id.toLowerCase().includes(q);
      if (!searchMatch) return false;

      switch (activeTab) {
        case 'UNPAID': return order.orderStatus === 'WAITING_FOR_PAYMENT' || order.paymentStatus === 'UNPAID';
        case 'PAID': return (order.paymentStatus === 'PAID' && order.orderStatus === 'PROCESSING') || order.orderStatus === 'PAID';
        case 'PROCESSING': return order.orderStatus === 'PREPARING';
        case 'SHIPPED': return order.orderStatus === 'IN_DELIVERY';
        case 'DELIVERED': return order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED';
        default: return true;
      }
    });
  }, [initialOrders, searchQuery, activeTab]);

  const counts = useMemo(() => {
    return {
      ALL: initialOrders.length,
      UNPAID: initialOrders.filter(o => o.orderStatus === 'WAITING_FOR_PAYMENT' || o.paymentStatus === 'UNPAID').length,
      PAID: initialOrders.filter(o => (o.paymentStatus === 'PAID' && o.orderStatus === 'PROCESSING') || o.orderStatus === 'PAID').length,
      PROCESSING: initialOrders.filter(o => o.orderStatus === 'PREPARING').length,
      SHIPPED: initialOrders.filter(o => o.orderStatus === 'IN_DELIVERY').length,
      DELIVERED: initialOrders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED').length,
    };
  }, [initialOrders]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_PAYMENT':
        return { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Belum Bayar', canCancel: true };
      case 'PAID':
        return { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Dibayar', canCancel: true };
      case 'PROCESSING':
        return { color: 'text-sky-700 bg-sky-50 border-sky-200', label: 'Sedang Diproses', canCancel: true };
      case 'PREPARING':
        return { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', label: 'Sedang Dikemas', canCancel: true };
      case 'IN_DELIVERY':
        return { color: 'text-blue-700 bg-blue-50 border-blue-200', label: 'Dalam Pengiriman', canCancel: false };
      case 'DELIVERED':
        return { color: 'text-dark-green bg-emerald-100/60 border-emerald-300', label: 'Terkirim', canCancel: false };
      case 'COMPLETED':
        return { color: 'text-dark-green bg-emerald-100/60 border-emerald-300', label: 'Selesai', canCancel: false };
      case 'RETURN_REQUESTED':
        return { color: 'text-amber-800 bg-amber-50 border-amber-200', label: 'Pengajuan Retur', canCancel: false };
      case 'RETURNED':
        return { color: 'text-gray-700 bg-gray-100 border-gray-200', label: 'Retur Selesai', canCancel: false };
      case 'CANCELLED':
        return { color: 'text-rose-700 bg-rose-50 border-rose-200', label: 'Dibatalkan', canCancel: false };
      default:
        return { color: 'text-gray-600 bg-gray-50 border-gray-200', label: status, canCancel: false };
    }
  };

  const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapJsUrl = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return (
    <div className="space-y-6">
      <Script 
        src={snapJsUrl} 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* Search Input Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-main/40">
          <MagnifyingGlass size={16} weight="duotone" />
        </div>
        <input
          type="text"
          placeholder="Cari transaksi berdasarkan invoice atau nomor pesanan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          maxLength={100}
          className="block w-full pl-10 pr-3.5 py-2.5 bg-[#faf9f6] border border-[#ede8de] rounded-xl text-xs text-text-main placeholder:text-text-main/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-green focus:border-primary-green transition-all shadow-2xs"
        />
      </div>

      {/* TasteSkill v2 Filter Pill Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'ALL', label: 'Semua' },
          { id: 'UNPAID', label: 'Belum Bayar' },
          { id: 'PAID', label: 'Dibayar' },
          { id: 'PROCESSING', label: 'Dikemas' },
          { id: 'SHIPPED', label: 'Dikirim' },
          { id: 'DELIVERED', label: 'Selesai' },
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-bold select-none border ${
                isSelected 
                  ? 'bg-dark-green text-white border-dark-green shadow-2xs' 
                  : 'bg-[#faf9f6] text-text-main/75 hover:bg-[#f3ede3] hover:text-text-main border-[#ede8de]'
              }`}
            >
              {tab.label} ({counts[tab.id as keyof typeof counts]})
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-[#faf9f6] rounded-2xl border border-[#ede8de] p-6">
          <Package size={44} weight="duotone" className="text-text-main/30 mb-3" />
          <h3 className="font-serif font-bold text-base text-text-main mb-1">
            Tidak Ada Transaksi Ditemukan
          </h3>
          <p className="text-xs text-text-main/60 max-w-sm leading-relaxed">
            Tidak ada riwayat pesanan yang cocok dengan filter atau kata kunci pencarian saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.orderStatus);
            const displayId = order.invoiceId || order.orderId || order.id.split('-')[0];
            const isExpanded = expandedOrders.has(order.id);
            const maxVisibleImages = 3;
            const items = order.orderItems || [];
            
            const visibleItems = isExpanded ? items : items.slice(0, maxVisibleImages);
            const remainingCount = items.length - maxVisibleImages;

            return (
              <div 
                key={order.id} 
                className="bg-white border border-[#ede8de] hover:border-[#dfd8cc] rounded-2xl overflow-hidden transition-all shadow-2xs"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 border-b border-[#ede8de]/80 bg-[#faf8f4]">
                  <div className="flex items-center gap-3 mb-1.5 sm:mb-0">
                    <span className="font-bold text-xs text-text-main font-mono">{displayId}</span>
                    <span className="text-[11px] text-text-main/50 font-medium">
                      {formatDate(new Date(order.createdAt))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-md border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    {statusConfig.canCancel && (
                      <button 
                        type="button"
                        onClick={() => openCancelModal(order.id)}
                        disabled={isCancelling === order.id}
                        className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        title="Batalkan Pesanan"
                        aria-label="Batalkan Pesanan"
                      >
                        <XCircle size={15} weight="duotone" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Images & Details */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                    {/* Images Row */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {visibleItems.map((item: any) => (
                        <div key={item.id} className="w-12 h-12 rounded-xl border border-[#ede8de] overflow-hidden bg-[#faf9f6] shrink-0 relative">
                          {item.product?.images?.[0]?.url ? (
                            <Image src={item.product.images[0].url} alt={item.product.title || 'Produk'} fill sizes="48px" className="object-contain p-1" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-main/30">
                              <Package size={16} weight="duotone" />
                            </div>
                          )}
                        </div>
                      ))}
                      {!isExpanded && remainingCount > 0 && (
                        <div className="w-12 h-12 rounded-xl border border-[#ede8de] bg-[#f5f1ea] shrink-0 flex items-center justify-center text-text-main/70 font-bold text-[11px]">
                          +{remainingCount}
                        </div>
                      )}
                    </div>
                    
                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-text-main truncate">
                        {items[0]?.product?.title || 'Produk Herbal'}
                      </h4>
                      <p className="text-[11px] text-text-main/60 mt-0.5">
                        {items.reduce((acc: number, item: any) => acc + item.count, 0)} barang • {items.length} sediaan fitofarmaka
                      </p>
                      {items.length > maxVisibleImages && (
                        <button 
                          type="button"
                          onClick={() => toggleExpand(order.id)}
                          className="text-primary-green text-[11px] font-bold mt-1.5 inline-flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>{isExpanded ? 'Sembunyikan' : `Lihat ${remainingCount} produk lainnya`}</span>
                          {isExpanded ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 border-t border-[#ede8de]/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#faf9f6]/40">
                  <div>
                    <span className="text-[10px] text-text-main/50 uppercase font-bold tracking-wider block">
                      Total Belanja
                    </span>
                    <span className="text-sm font-bold text-dark-green">
                      {formatRupiah(Number(order.paymentAmount || 0))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {order.orderStatus === 'WAITING_FOR_PAYMENT' && order.snapToken && (
                      <button
                        type="button"
                        onClick={() => handlePay(order.snapToken!, order.orderId!)}
                        disabled={isPayingId === order.orderId}
                        className="flex-1 sm:flex-initial text-center bg-dark-green hover:bg-primary-green disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                      >
                        {isPayingId === order.orderId ? 'Membuka...' : 'Bayar Sekarang'}
                      </button>
                    )}
                    {['COMPLETED', 'DELIVERED'].includes(order.orderStatus) && (
                      <a
                        href={`/invoice/${order.orderId || order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial text-center inline-flex items-center justify-center gap-1.5 border border-[#ede8de] hover:border-primary-green bg-white text-text-main hover:text-primary-green px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
                        title="Lihat / Cetak Faktur Resmi"
                      >
                        <Printer size={14} weight="duotone" />
                        <span>Faktur</span>
                      </a>
                    )}
                    <button 
                      type="button"
                      onClick={() => toggleDetails(order.id)}
                      className="flex-1 sm:flex-initial text-center border border-dark-green text-dark-green hover:bg-dark-green hover:text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                    >
                      Rincian
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Pesanan (TasteSkill v2 Floating Card) */}
      {isModalOpen && selectedOrderForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-[#ede8de] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede8de] bg-[#faf8f4] sticky top-0 z-10">
              <div>
                <h3 className="font-serif font-bold text-base text-text-main">
                  Rincian Transaksi
                </h3>
                <p className="text-[11px] text-text-main/60 font-mono mt-0.5">
                  {selectedOrderForModal.invoiceId || selectedOrderForModal.orderId}
                </p>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-text-main/40 hover:text-text-main hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 bg-white">
              {/* Alamat Pengiriman */}
              <div className="bg-[#faf9f6] p-4 rounded-xl border border-[#ede8de]">
                <div className="flex items-center gap-2 font-bold text-text-main text-xs mb-2.5 pb-2 border-b border-[#ede8de]">
                  <MapPin size={16} weight="duotone" className="text-primary-green" />
                  <span>Informasi Pengiriman</span>
                </div>
                <div className="text-xs text-text-main/70 space-y-1">
                  <p className="font-bold text-text-main">{selectedOrderForModal.shippingName}</p>
                  <p>{selectedOrderForModal.shippingMobile}</p>
                  <p className="leading-relaxed">{selectedOrderForModal.shippingAddress}</p>
                  <p>{selectedOrderForModal.shippingCity}, {selectedOrderForModal.shippingProvince}, {selectedOrderForModal.shippingPostalCode}</p>
                  {selectedOrderForModal.shippingNote && (
                    <p className="mt-2 text-text-main/70 italic bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                      &ldquo;{selectedOrderForModal.shippingNote}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Status Pembayaran & Pengiriman */}
              <div className="bg-[#faf9f6] p-4 rounded-xl border border-[#ede8de]">
                <div className="flex items-center gap-2 font-bold text-text-main text-xs mb-2.5 pb-2 border-b border-[#ede8de]">
                  <CreditCard size={16} weight="duotone" className="text-primary-green" />
                  <span>Pembayaran &amp; Kurir</span>
                </div>
                <div className="text-xs text-text-main/70 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Status Pembayaran</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedOrderForModal.paymentStatus === 'PAID' ? 'bg-emerald-100 text-dark-green' : 'bg-amber-100 text-amber-800'}`}>
                      {selectedOrderForModal.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Dibayar'}
                    </span>
                  </div>
                  {selectedOrderForModal.paymentType && (
                    <div className="flex justify-between">
                      <span>Metode</span>
                      <span className="font-bold text-text-main uppercase">{selectedOrderForModal.paymentType.replace('_', ' ')}</span>
                    </div>
                  )}
                  {/*
                   * Informasi kurir dan nomor resi hanya ditampilkan jika pesanan telah diserahkan 
                   * ke pihak logistik (IN_DELIVERY ke atas). Saat tahap pengemasan (PREPARING) atau sebelumnya, 
                   * nilai kurir dan nomor resi tetap kosong (-) agar ekspektasi pengguna akurat.
                   */}
                  <div className="flex justify-between">
                    <span>Kurir</span>
                    <span className="font-bold text-text-main uppercase">
                      {['IN_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(selectedOrderForModal.orderStatus)
                        ? (selectedOrderForModal.courier || '-')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Nomor Resi</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#ede8de] text-text-main font-bold text-xs">
                      {['IN_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(selectedOrderForModal.orderStatus)
                        ? (selectedOrderForModal.resi || '-')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product List in Modal */}
              <div className="bg-[#faf9f6] p-4 rounded-xl border border-[#ede8de]">
                <div className="flex items-center gap-2 font-bold text-text-main text-xs mb-2.5 pb-2 border-b border-[#ede8de]">
                  <Receipt size={16} weight="duotone" className="text-primary-green" />
                  <span>Rincian Produk</span>
                </div>
                <div className="space-y-3">
                  {selectedOrderForModal.orderItems.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-xl border border-[#ede8de] overflow-hidden bg-white shrink-0 relative">
                        {item.product?.images?.[0]?.url ? (
                          <Image src={item.product.images[0].url} alt={item.product.title || 'Produk'} fill sizes="48px" className="object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-main/30">
                            <Package size={16} weight="duotone" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-text-main text-xs truncate">{item.product?.title || 'Produk Herbal'}</h4>
                        <p className="text-[11px] text-text-main/60 mt-0.5">{item.count} sediaan × {formatRupiah(Number(item.price))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#ede8de] bg-[#faf8f4] sticky bottom-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-main/70 font-medium">Total Tagihan</span>
                <span className="text-base font-bold text-dark-green">{formatRupiah(Number(selectedOrderForModal.paymentAmount || 0))}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Tombol Batalkan di modal detail — hanya untuk status yang masih bisa dibatalkan */}
                {getStatusConfig(selectedOrderForModal.orderStatus).canCancel && (
                  <button
                    type="button"
                    onClick={() => { handleCloseModal(); openCancelModal(selectedOrderForModal.id); }}
                    disabled={isCancelling === selectedOrderForModal.id}
                    className="flex-1 h-[38px] text-xs bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 font-bold rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} weight="duotone" />
                    <span>Batalkan</span>
                  </button>
                )}

                {['COMPLETED', 'DELIVERED'].includes(selectedOrderForModal.orderStatus) && (
                  <a
                    href={`/invoice/${selectedOrderForModal.orderId || selectedOrderForModal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center inline-flex items-center justify-center gap-1.5 border border-[#ede8de] hover:border-primary-green bg-white text-text-main hover:text-primary-green font-bold text-xs h-[38px] rounded-xl transition-all shadow-2xs"
                  >
                    <Printer size={14} weight="duotone" />
                    <span>Cetak Faktur</span>
                  </a>
                )}

                {selectedOrderForModal.orderStatus === 'WAITING_FOR_PAYMENT' && selectedOrderForModal.snapToken && (
                  <button
                    type="button"
                    onClick={() => handlePay(selectedOrderForModal.snapToken!, selectedOrderForModal.orderId!)}
                    disabled={isPayingId === selectedOrderForModal.orderId}
                    className="flex-1 h-[38px] text-xs bg-dark-green hover:bg-primary-green disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    {isPayingId === selectedOrderForModal.orderId ? 'Membuka...' : 'Bayar Sekarang'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  Modal Konfirmasi Pembatalan Pesanan                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      {isCancelModalOpen && cancelModalOrder && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={closeCancelModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl border border-[#ede8de] animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Modal Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede8de] bg-rose-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <WarningOctagon size={18} weight="duotone" className="text-rose-600" />
                </div>
                <div>
                  <h3 id="cancel-modal-title" className="font-serif font-bold text-sm text-text-main">
                    Batalkan Pesanan
                  </h3>
                  <p className="text-[11px] text-text-main/55 font-mono mt-0.5">
                    {cancelModalOrder.invoiceId || cancelModalOrder.orderId || cancelModalOrder.id.split('-')[0]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCancelModal}
                className="p-1.5 text-text-main/40 hover:text-text-main hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* ── Modal Body ── */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Warning callout */}
              <div className="flex gap-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl p-3">
                <WarningCircle size={16} weight="duotone" className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Pembatalan pesanan bersifat <strong>permanen</strong> dan tidak dapat dibatalkan kembali.
                  Jika sudah melakukan pembayaran, dana akan dikembalikan sesuai kebijakan pengembalian.
                </p>
              </div>

              {/* Reason selection */}
              <div>
                <label className="block text-xs font-bold text-text-main mb-2.5">
                  Pilih alasan pembatalan:
                </label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs leading-relaxed ${
                        cancelReason === reason
                          ? 'border-rose-300 bg-rose-50/60 text-text-main ring-1 ring-rose-200'
                          : 'border-[#ede8de] bg-[#faf9f6] text-text-main/80 hover:border-[#dfd8cc] hover:bg-[#f5f1ea]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={() => setCancelReason(reason)}
                        className="accent-rose-500 shrink-0"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}

                  {/* Option "Lainnya" */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs leading-relaxed ${
                      cancelReason === REASON_OTHER_KEY
                        ? 'border-rose-300 bg-rose-50/60 text-text-main ring-1 ring-rose-200'
                        : 'border-[#ede8de] bg-[#faf9f6] text-text-main/80 hover:border-[#dfd8cc] hover:bg-[#f5f1ea]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={REASON_OTHER_KEY}
                      checked={cancelReason === REASON_OTHER_KEY}
                      onChange={() => setCancelReason(REASON_OTHER_KEY)}
                      className="accent-rose-500 shrink-0"
                    />
                    <span>Lainnya</span>
                  </label>

                  {/* Text input for custom reason — shown only when "Lainnya" is selected */}
                  {cancelReason === REASON_OTHER_KEY && (
                    <textarea
                      value={cancelReasonOther}
                      onChange={(e) => setCancelReasonOther(e.target.value)}
                      placeholder="Jelaskan alasan pembatalan Anda..."
                      maxLength={300}
                      rows={3}
                      className="w-full mt-1 px-3.5 py-2.5 bg-white border border-[#ede8de] rounded-xl text-xs text-text-main placeholder:text-text-main/40 focus:outline-none focus:ring-1 focus:ring-rose-300 focus:border-rose-300 transition-all resize-none"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div className="px-5 py-4 border-t border-[#ede8de] bg-[#faf8f4] flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeCancelModal}
                className="flex-1 h-[38px] text-xs border border-[#ede8de] hover:border-[#dfd8cc] bg-white text-text-main font-bold rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                disabled={isConfirmDisabled}
                className="flex-1 h-[38px] text-xs bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                {isCancelling === cancelModalOrderId ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Membatalkan...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} weight="bold" />
                    <span>Ya, Batalkan Pesanan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
