'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, Search, XCircle, ChevronDown, ChevronUp, MapPin, CreditCard, Box, Printer } from 'lucide-react';
import { cancelOrder } from '@/app/actions/order';
import toast from 'react-hot-toast';

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
};

export function OrdersListClient({ initialOrders }: { initialOrders: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNPAID' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('ALL');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

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
    // Instead of multiple, let's just use string or null for Modal
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
      (window as any).snap.pay(snapToken, {
        onSuccess: function () {
          toast.success('Pembayaran berhasil diproses!');
          window.location.reload();
        },
        onPending: function () {
          toast.success('Menunggu pembayaran Anda!');
          window.location.reload();
        },
        onError: function () {
          toast.error('Pembayaran gagal!');
        },
        onClose: function () {
          toast.error('Anda menutup layar pembayaran.');
        }
      });
    } else {
      toast.error('Sistem pembayaran belum siap, silakan coba lagi.');
    }
  };

  const handleCancel = async (orderId: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      setIsCancelling(orderId);
      const res = await cancelOrder(orderId);
      if (res.success) {
        toast.success('Pesanan berhasil dibatalkan.');
        window.location.reload(); // Quick refresh to get new server data
      } else {
        toast.error(res.error || 'Gagal membatalkan pesanan.');
      }
      setIsCancelling(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => {
      const searchMatch = order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;

      switch (activeTab) {
        case 'UNPAID': return order.orderStatus === 'WAITING_FOR_PAYMENT' || order.paymentStatus === 'UNPAID';
        case 'PAID': return order.orderStatus === 'PAID';
        case 'PROCESSING': return order.orderStatus === 'PROCESSING';
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
      PAID: initialOrders.filter(o => o.orderStatus === 'PAID').length,
      PROCESSING: initialOrders.filter(o => o.orderStatus === 'PROCESSING').length,
      SHIPPED: initialOrders.filter(o => o.orderStatus === 'IN_DELIVERY').length,
      DELIVERED: initialOrders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED').length,
    };
  }, [initialOrders]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_PAYMENT':
        return { color: 'text-orange-500 bg-orange-50 border-orange-100', label: 'Belum Bayar', canCancel: true };
      case 'PAID':
        return { color: 'text-green-500 bg-green-50 border-green-100', label: 'Dibayar', canCancel: true };
      case 'PROCESSING':
        return { color: 'text-blue-500 bg-blue-50 border-blue-100', label: 'Sedang Diproses', canCancel: true };
      case 'PREPARING':
        return { color: 'text-purple-500 bg-purple-50 border-purple-100', label: 'Sedang Dikemas', canCancel: true };
      case 'IN_DELIVERY':
        return { color: 'text-indigo-500 bg-indigo-50 border-indigo-100', label: 'Dalam Pengiriman', canCancel: false };
      case 'DELIVERED':
        return { color: 'text-emerald-500 bg-emerald-50 border-emerald-100', label: 'Terkirim', canCancel: false };
      case 'COMPLETED':
        return { color: 'text-green-600 bg-green-50 border-green-100', label: 'Selesai', canCancel: false };
      case 'RETURN_REQUESTED':
        return { color: 'text-amber-600 bg-amber-50 border-amber-100', label: 'Pengajuan Retur', canCancel: false };
      case 'RETURNED':
        return { color: 'text-gray-600 bg-gray-100 border-gray-200', label: 'Retur Selesai', canCancel: false };
      case 'CANCELLED':
        return { color: 'text-red-500 bg-red-50 border-red-100', label: 'Dibatalkan', canCancel: false };
      default:
        return { color: 'text-gray-500 bg-gray-50 border-gray-100', label: status, canCancel: false };
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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari berdasarkan nomor pesanan atau invoice..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-green focus:border-primary-green sm:text-sm transition-shadow shadow-sm"
        />
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 border-b border-gray-100">
        {[
          { id: 'ALL', label: 'Semua' },
          { id: 'UNPAID', label: 'Belum Bayar' },
          { id: 'PAID', label: 'Dibayar' },
          { id: 'PROCESSING', label: 'Dikemas' },
          { id: 'SHIPPED', label: 'Dikirim' },
          { id: 'DELIVERED', label: 'Selesai' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({counts[tab.id as keyof typeof counts]})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
           <Package size={48} className="text-gray-300 mb-4" />
           <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak ada transaksi</h3>
           <p className="text-gray-500 text-sm">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
         </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.orderStatus);
            const displayId = order.invoiceId || order.orderId || order.id.split('-')[0];
            const isExpanded = expandedOrders.has(order.id);
            const maxVisibleImages = 3;
            const items = order.orderItems;
            
            const visibleItems = isExpanded ? items : items.slice(0, maxVisibleImages);
            const remainingCount = items.length - maxVisibleImages;
            const isDetailsExpanded = expandedDetails.has(order.id);

            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <span className="font-bold text-sm text-gray-900">{displayId}</span>
                    <span className="text-xs text-gray-500">{formatDate(new Date(order.createdAt))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    {statusConfig.canCancel && (
                      <button 
                        onClick={() => handleCancel(order.id)}
                        disabled={isCancelling === order.id}
                        className="text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 p-1 rounded-full disabled:opacity-50"
                        title="Batalkan Pesanan"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Images & Details */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Images Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {visibleItems.map((item: any) => (
                        <div key={item.id} className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0 relative">
                          {item.product?.images?.[0]?.url ? (
                            <Image src={item.product.images[0].url} alt={item.product.title || 'Produk'} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={14} />
                            </div>
                          )}
                        </div>
                      ))}
                      {!isExpanded && remainingCount > 0 && (
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 shrink-0 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                          +{remainingCount}
                        </div>
                      )}
                    </div>
                    
                    {/* Text Details */}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{items[0]?.product?.title || 'Produk Dihapus'}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {items.reduce((acc: number, item: any) => acc + item.count, 0)} barang • {items.length} macam produk
                      </p>
                      {items.length > maxVisibleImages && (
                        <button 
                          onClick={() => toggleExpand(order.id)}
                          className="text-blue-600 text-[11px] font-bold mt-1.5 flex items-center gap-1 hover:text-blue-700"
                        >
                          {isExpanded ? 'Sembunyikan' : `Lihat ${remainingCount} produk lainnya`}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total Belanja</p>
                    <p className="text-base font-bold text-green-600">{formatRupiah(Number(order.paymentAmount || 0))}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {['COMPLETED', 'DELIVERED'].includes(order.orderStatus) && (
                      <a
                        href={`/invoice/${order.orderId || order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial text-center inline-flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        title="Lihat / Cetak Faktur Resmi"
                      >
                        <Printer size={13} />
                        <span>Faktur</span>
                      </a>
                    )}
                    <button 
                      onClick={() => toggleDetails(order.id)}
                      className="flex-1 sm:flex-initial text-center border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Pop-over Detail Pesanan */}
      {isModalOpen && selectedOrderForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-base text-gray-900">Detail Pesanan</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedOrderForModal.invoiceId || selectedOrderForModal.orderId}</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {/* Alamat Pengiriman */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3 border-b border-gray-100 pb-2">
                  <MapPin size={16} className="text-blue-500" />
                  Info Pengiriman
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900 text-sm">{selectedOrderForModal.shippingName}</p>
                  <p>{selectedOrderForModal.shippingMobile}</p>
                  <p>{selectedOrderForModal.shippingAddress}</p>
                  <p>{selectedOrderForModal.shippingCity}, {selectedOrderForModal.shippingProvince}, {selectedOrderForModal.shippingPostalCode}</p>
                  {selectedOrderForModal.shippingNote && (
                    <p className="mt-2 text-gray-500 italic bg-amber-50 p-2 rounded-lg border border-amber-100">
                      " {selectedOrderForModal.shippingNote} "
                    </p>
                  )}
                </div>
              </div>

              {/* Status Pembayaran & Pengiriman */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3 border-b border-gray-100 pb-2">
                  <CreditCard size={16} className="text-green-500" />
                  Pembayaran & Pengiriman
                </div>
                <div className="text-xs text-gray-600 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span>Status Pembayaran</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedOrderForModal.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {selectedOrderForModal.paymentStatus === 'PAID' ? 'Selesai' : 'Belum Dibayar'}
                    </span>
                  </div>
                  {selectedOrderForModal.paymentType && (
                    <div className="flex justify-between">
                      <span>Metode</span>
                      <span className="font-semibold text-gray-900 uppercase">{selectedOrderForModal.paymentType.replace('_', ' ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Kurir</span>
                    <span className="font-semibold text-gray-900 uppercase">{selectedOrderForModal.courier || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Nomor Resi</span>
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-semibold">{selectedOrderForModal.resi || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Product List in Modal */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-3 border-b border-gray-100 pb-2">
                  <Box size={16} className="text-purple-500" />
                  Rincian Produk
                </div>
                <div className="space-y-3">
                  {selectedOrderForModal.orderItems.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center">
                       <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0 relative">
                        {item.product?.images?.[0]?.url ? (
                          <Image src={item.product.images[0].url} alt={item.product.title || 'Produk'} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-xs truncate">{item.product?.title || 'Produk Dihapus'}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.count} barang x {formatRupiah(Number(item.price))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-500 font-medium">Total Pesanan</span>
                 <span className="text-lg font-bold text-green-600">{formatRupiah(Number(selectedOrderForModal.paymentAmount || 0))}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {['COMPLETED', 'DELIVERED'].includes(selectedOrderForModal.orderStatus) && (
                  <a
                    href={`/invoice/${selectedOrderForModal.orderId || selectedOrderForModal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center inline-flex items-center justify-center gap-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs h-[40px] rounded-xl transition-colors"
                  >
                    <Printer size={14} />
                    <span>Cetak Faktur</span>
                  </a>
                )}

                {selectedOrderForModal.orderStatus === 'WAITING_FOR_PAYMENT' && selectedOrderForModal.snapToken && (
                  <button
                    onClick={() => handlePay(selectedOrderForModal.snapToken!, selectedOrderForModal.orderId!)}
                    className="flex-1 h-[40px] text-xs bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-xl transition-colors shadow-md shadow-green-100/50"
                  >
                    Bayar Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
