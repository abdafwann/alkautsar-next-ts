'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlass,
  Package,
  MapPin,
  Truck,
  CheckCircle,
  CaretRight,
  CircleNotch,
  WarningCircle,
  CreditCard,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Question,
  ArrowsClockwise,
  Warning,
  ChatCircleDots
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmOrderDelivery, requestOrderComplaint } from '@/app/actions/order';

interface OrderItem {
  id: string;
  count: number;
  price: number;
  product: {
    title: string;
    slug?: string;
    images?: Array<{ url: string }>;
  };
}

interface ShippingInfo {
  name: string;
  mobile: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  note?: string;
}

interface OrderData {
  id: string;
  orderId: string;
  guestEmail?: string;
  orderStatus: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentExpiry?: string;
  resi?: string;
  courier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  snapToken?: string | null;
  shippingName?: string;
  shippingMobile?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  shippingNote?: string;
  shipping?: ShippingInfo;
  orderItems: OrderItem[];
}

const TIMELINE_STEPS = [
  { id: 'WAITING_FOR_PAYMENT', title: 'Pesanan Dibuat', desc: 'Menunggu konfirmasi pembayaran' },
  { id: 'PROCESSING', title: 'Pembayaran Diterima', desc: 'Pesanan diverifikasi sistem' },
  { id: 'PREPARING', title: 'Sedang Dikemas', desc: 'Paket disiapkan di gudang' },
  { id: 'IN_DELIVERY', title: 'Dalam Pengiriman', desc: 'Paket dalam perjalanan kurir' },
  { id: 'DELIVERED', title: 'Terkirim & Selesai', desc: 'Paket sampai & dikonfirmasi' }
];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

function getStatusIndex(status: string): number {
  switch (status) {
    case 'WAITING_FOR_PAYMENT':
      return 0;
    case 'PROCESSING':
      return 1;
    case 'PREPARING':
      return 2;
    case 'IN_DELIVERY':
      return 3;
    case 'DELIVERED':
      return 4;
    case 'COMPLETED':
      return 5;
    case 'CANCELLED':
      return -1;
    default:
      return 0;
  }
}

function TrackOrderContent() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryEmail = searchParams.get('email');
    const queryOrderId = searchParams.get('orderId');

    if (queryOrderId) {
      setOrderId(queryOrderId);
      if (queryEmail) {
        setEmail(queryEmail);
      }
      fetchOrder(queryEmail || '', queryOrderId);
    }
  }, [searchParams]);

  const fetchOrder = async (searchEmail: string, searchOrderId: string) => {
    setIsLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: searchEmail.trim(), orderId: searchOrderId.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal melacak pesanan');
      }

      setOrderData(data.order);
      if (data.order?.guestEmail) {
        setEmail(data.order.guestEmail);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (!orderData?.snapToken) {
      toast.error('Token pembayaran tidak ditemukan. Silakan hubungi admin.');
      return;
    }

    // @ts-ignore
    if (window.snap) {
      // @ts-ignore
      window.snap.pay(orderData.snapToken, {
        onSuccess: function () {
          toast.success('Pembayaran berhasil!');
          router.push(`/payment/${orderData.orderId}/success`);
        },
        onPending: function () {
          toast.success('Menunggu pembayaran Anda!');
          router.push(`/payment/${orderData.orderId}/pending`);
        },
        onError: function () {
          toast.error('Pembayaran gagal!');
        },
        onClose: function () {
          toast.error('Jendela pembayaran ditutup');
        }
      });
    } else {
      toast.error('Gagal memuat modul pembayaran. Silakan refresh halaman.');
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !orderId.trim()) {
      toast.error('Mohon isi Email dan Nomor Pesanan');
      return;
    }
    fetchOrder(email, orderId);
  };

  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintReason, setComplaintReason] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  const getComplaintWhatsAppUrl = (order: OrderData, reasonText?: string) => {
    const phone = '6281234567890';
    const reason = reasonText || 'Produk rusak / bocor / tidak sesuai pesanan';
    const message = `Halo Admin Al-Kautsar Herbal,%0A%0ASaya ingin mengajukan komplain / klaim garansi untuk pesanan:%0A- *ID Pesanan*: ${order.orderId}%0A- *Nama*: ${order.shippingName || 'Pelanggan'}%0A- *Kendala*: ${encodeURIComponent(reason)}%0A%0ABerikut saya lampirkan foto dan video unboxing paketnya. Mohon diproses. Terima kasih.`;
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleExecuteConfirm = async () => {
    if (!orderData) return;

    setIsConfirming(true);
    try {
      const res = await confirmOrderDelivery(orderData.orderId, email || orderData.guestEmail);
      if (res.success) {
        toast.success('Pesanan berhasil dikonfirmasi selesai!');
        setShowConfirmModal(false);
        fetchOrder(email || orderData.guestEmail || '', orderData.orderId);
      } else {
        toast.error(res.error || 'Gagal mengkonfirmasi penerimaan pesanan');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleExecuteComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData) return;
    if (!complaintReason.trim()) {
      toast.error('Mohon jelaskan kendala atau kerusakan produk');
      return;
    }

    setIsSubmittingComplaint(true);
    try {
      const res = await requestOrderComplaint(orderData.orderId, complaintReason.trim(), email || orderData.guestEmail);
      if (res.success) {
        toast.success('Pengajuan komplain berhasil dikirim!');
        const waUrl = getComplaintWhatsAppUrl(orderData, complaintReason.trim());
        setShowComplaintModal(false);
        fetchOrder(email || orderData.guestEmail || '', orderData.orderId);
        window.open(waUrl, '_blank');
      } else {
        toast.error(res.error || 'Gagal mengajukan komplain');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    toast.success('Nomor resi berhasil disalin!');
    setTimeout(() => setCopiedResi(false), 2500);
  };

  const currentStepIdx = orderData ? getStatusIndex(orderData.orderStatus) : 0;
  const isCancelled = orderData?.orderStatus === 'CANCELLED';

  const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapJsUrl = isProd ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-16">
      <Script
        src={snapJsUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-2.5 text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-green transition-colors">Beranda</Link>
          <CaretRight size={13} className="text-gray-400" />
          <span className="text-gray-900 font-medium">Lacak Pesanan</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-gray-200 gap-1.5">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              Pelacakan Pesanan
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pantau status pemrosesan dan pengiriman paket herbal Anda secara real-time.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-green hover:underline self-start sm:self-auto"
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Minimalist Search Box */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-2xs">
          <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Pemesan <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
              />
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ID / Nomor Pesanan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ORDER-1788XXXXX"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={13} className="animate-spin" />
                    <span>Mencari...</span>
                  </>
                ) : (
                  <>
                    <MagnifyingGlass size={13} />
                    <span>Lacak</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-xs">
              <WarningCircle size={14} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Details View */}
        {orderData && (
          <div className="space-y-4">
            
            {/* Status & Milestones Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-2xs space-y-4">
              
              {/* Order Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block mb-0.5">NOMOR PESANAN</span>
                  <h2 className="text-sm font-bold font-mono text-gray-900">{orderData.orderId}</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Dibuat pada:{' '}
                    {new Date(orderData.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} WIB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                    orderData.paymentStatus === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {orderData.paymentStatus === 'PAID' ? 'Pembayaran Lunas' : 'Belum Dibayar'}
                  </span>
                </div>
              </div>

              {/* Waiting Payment Alert */}
              {orderData.orderStatus === 'WAITING_FOR_PAYMENT' && orderData.snapToken && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                  <div>
                    <h3 className="font-bold text-amber-900 mb-0.5">Menunggu Pembayaran</h3>
                    <p className="text-amber-700 text-[11px]">
                      Selesaikan transaksi agar pesanan Anda dapat segera diproses & dikirim.
                    </p>
                  </div>
                  <button
                    onClick={handlePayment}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
                  >
                    <CreditCard size={13} />
                    <span>Bayar Sekarang</span>
                  </button>
                </div>
              )}

              {/* Cancelled Notice */}
              {isCancelled && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-0.5">
                  <p className="font-bold">Pesanan Telah Dibatalkan</p>
                  <p className="text-[11px] text-red-600">
                    Batas waktu pembayaran telah habis atau pesanan dibatalkan oleh sistem. Stok telah dikembalikan.
                  </p>
                </div>
              )}

              {/* Progressive Stepper Timeline */}
              {!isCancelled && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
                    {TIMELINE_STEPS.map((step, idx) => {
                      const isCompleted = currentStepIdx > idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div
                          key={step.id}
                          className={`p-2.5 rounded-lg border text-xs transition-all ${
                            isCurrent
                              ? 'bg-emerald-50/60 border-primary-green text-gray-900 shadow-2xs ring-1 ring-primary-green/30'
                              : isCompleted
                              ? 'bg-gray-50/60 border-gray-200 text-gray-700'
                              : 'bg-white border-gray-100 text-gray-400 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                isCompleted
                                  ? 'bg-primary-green text-white'
                                  : isCurrent
                                  ? 'bg-primary-green text-white animate-pulse'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {isCompleted ? <Check size={10} /> : idx + 1}
                            </div>
                            <span className="font-bold text-[11px] line-clamp-1">{step.title}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Action Card with 2 Buttons: Complaint & Confirm */}
              {(orderData.orderStatus === 'IN_DELIVERY' || orderData.orderStatus === 'DELIVERED') && (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-green text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <CheckCircle size={16} weight="fill" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {orderData.orderStatus === 'DELIVERED'
                            ? 'Paket Telah Tiba di Alamat Tujuan'
                            : 'Paket Sedang Dalam Perjalanan'}
                        </h4>
                        <p className="text-gray-600 text-[11px] mt-0.5">
                          Periksa isi paket Anda. Jika sesuai silakan konfirmasi selesai, atau ajukan komplain jika ada kendala.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      {/* Button 1: Komplain / Retur */}
                      <button
                        type="button"
                        onClick={() => setShowComplaintModal(true)}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Warning size={13} className="text-amber-700" weight="fill" />
                        <span>Ajukan Komplain</span>
                      </button>

                      {/* Button 2: Konfirmasi Selesai */}
                      <button
                        type="button"
                        disabled={isConfirming}
                        onClick={() => setShowConfirmModal(true)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-60"
                      >
                        <Check size={14} strokeWidth={2.5} />
                        <span>Konfirmasi Pesanan</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Requested Banner */}
              {orderData.orderStatus === 'RETURN_REQUESTED' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <ArrowsClockwise size={15} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-950">Pengajuan Komplain / Retur Sedang Ditinjau</h4>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        Tim CS kami sedang meninjau klaim Anda. Silakan kirimkan video unboxing melalui WhatsApp CS untuk proses penukaran barang atau pengembalian dana.
                      </p>
                    </div>
                  </div>
                  <a
                    href={getComplaintWhatsAppUrl(orderData)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                  >
                    <ChatCircleDots size={14} weight="fill" />
                    <span>Chat CS WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Completed Status Banner */}
              {orderData.orderStatus === 'COMPLETED' && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-primary-green shrink-0" weight="fill" />
                    <span className="font-semibold text-emerald-900">
                      Pesanan telah selesai. Terima kasih telah berbelanja di Al-Kautsar Herbal!
                    </span>
                  </div>
                  <a
                    href={`/invoice/${orderData.orderId || orderData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-white hover:bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700 transition-colors shrink-0 shadow-2xs"
                  >
                    Lihat Invoice
                  </a>
                </div>
              )}

            </div>

            {/* Grid 2 Columns: Items & Shipping */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* Left Column (7 cols): Items List */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package size={13} className="text-gray-400" />
                    Rincian Produk
                  </span>
                  <span className="text-[11px] font-normal text-gray-400">
                    {orderData.orderItems.length} Item
                  </span>
                </h3>

                <div className="space-y-2.5 divide-y divide-gray-50">
                  {orderData.orderItems.map((item) => (
                    <div key={item.id} className="pt-2.5 first:pt-0 flex gap-2.5 items-center text-xs">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 p-1">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            width={40}
                            height={40}
                            style={{ width: 'auto', height: 'auto' }}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Package size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.product.title}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {item.count} x {formatRupiah(Number(item.price))}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900 font-mono text-xs shrink-0">
                        {formatRupiah(Number(item.price) * item.count)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-2.5 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-gray-900">Total Pembayaran</span>
                  <span className="text-sm font-black text-primary-green font-mono">
                    {formatRupiah(Number(orderData.paymentAmount))}
                  </span>
                </div>
              </div>

              {/* Right Column (5 cols): Shipping & Resi */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  Informasi Pengiriman
                </h3>

                <div className="space-y-2.5 text-xs">
                  {/* Receiver */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Penerima
                    </span>
                    <p className="font-bold text-gray-900">
                      {orderData.shippingName || orderData.shipping?.name || '-'}
                    </p>
                    <p className="text-gray-500 font-mono text-[11px]">
                      {orderData.shippingMobile || orderData.shipping?.mobile || '-'}
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Alamat Tujuan
                    </span>
                    <p className="text-gray-700 leading-relaxed">
                      {orderData.shippingAddress || orderData.shipping?.address || '-'}
                    </p>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {[
                        orderData.shippingCity || orderData.shipping?.city,
                        orderData.shippingProvince || orderData.shipping?.province,
                        orderData.shippingPostalCode || orderData.shipping?.postalCode
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  {/* Shipping Note */}
                  {(orderData.shippingNote || orderData.shipping?.note) && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                        Catatan Kurir
                      </span>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 text-[11px] italic">
                        "{orderData.shippingNote || orderData.shipping?.note}"
                      </p>
                    </div>
                  )}

                  {/* Ekspedisi & Nomor Resi Card */}
                  <div className="pt-2.5 border-t border-gray-100 space-y-2.5">
                    {/* Jasa Pengiriman / Kurir */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Jasa Ekspedisi / Kurir
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200">
                          <Truck size={13} className="text-primary-green shrink-0" />
                          <span>{orderData.courier || 'Kurir Standar'}</span>
                        </span>
                        <span className="text-[11px] text-gray-500">Layanan Reguler</span>
                      </div>
                    </div>

                    {/* Nomor Resi */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Nomor Resi Pengiriman
                      </span>
                      {orderData.resi ? (
                        <div className="flex items-center justify-between bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/80">
                          <div className="min-w-0 pr-2">
                            <span className="font-mono font-bold text-emerald-800 text-xs tracking-wider block select-all">
                              {orderData.resi}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyResi(orderData.resi || '')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-emerald-100/60 border border-emerald-200 text-[11px] font-semibold text-emerald-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
                            title="Salin Nomor Resi"
                          >
                            {copiedResi ? (
                              <>
                                <Check size={11} className="text-primary-green" />
                                <span>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-gray-500 text-[11px] flex items-center gap-2">
                          <Clock size={13} className="text-gray-400 shrink-0" />
                          <span>Resi akan diperbarui setelah paket diserahkan ke kurir.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Help Footnote */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <Question size={14} className="text-gray-400 shrink-0" />
                <span>Butuh bantuan terkait pesanan ini?</span>
              </div>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Alkautsar,%20saya%20ingin%20menanyakan%20status%20pesanan%20saya"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary-green hover:underline flex items-center gap-1"
              >
                <span>Hubungi Customer Service via WhatsApp</span>
                <CaretRight size={13} />
              </a>
            </div>

          </div>
        )}

        {/* Custom Delivery Confirmation Modal */}
        {showConfirmModal && orderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 text-center space-y-5 animate-in zoom-in-95 duration-200"
              role="dialog"
              aria-modal="true"
            >
              {/* Header Icon */}
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
                <CheckCircle size={28} className="text-primary-green" weight="fill" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">
                  Konfirmasi Pesanan Diterima
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Pastikan seluruh produk pesanan Anda telah tiba dalam kondisi baik dan lengkap sebelum menyelesaikan transaksi.
                </p>
              </div>

              {/* Order Mini Badge */}
              <div className="bg-gray-50 rounded-xl border border-gray-200/80 p-3 text-xs flex justify-between items-center text-left">
                <div>
                  <span className="text-[10px] text-gray-400 block font-mono uppercase">ID Pesanan</span>
                  <span className="font-mono font-bold text-gray-900">{orderData.orderId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase">Total</span>
                  <span className="font-bold text-primary-green">{formatRupiah(orderData.paymentAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={handleExecuteConfirm}
                  className="w-full h-10 rounded-xl bg-primary-green hover:bg-primary-green-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-60"
                >
                  {isConfirming ? (
                    <>
                      <CircleNotch size={13} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      <span>Ya, Diterima</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Complaint / Return Modal */}
        {showComplaintModal && orderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 text-left space-y-4 animate-in zoom-in-95 duration-200"
              role="dialog"
              aria-modal="true"
            >
              {/* Header Icon & Title */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200 shrink-0">
                  <Warning size={22} className="text-amber-600" weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Ajukan Komplain / Klaim Garansi
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Pesanan #{orderData.orderId}
                  </p>
                </div>
              </div>

              {/* Notice / Guidance */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs space-y-1">
                <p className="font-bold text-[11px]">Ketentuan Klaim Garansi & Retur:</p>
                <ul className="list-disc pl-4 text-[10px] text-amber-800 space-y-0.5">
                  <li>Wajib melampirkan video unboxing jelas tanpa jeda.</li>
                  <li>Produk cacat pabrik, rusak saat kirim, atau salah varian.</li>
                </ul>
              </div>

              {/* Form Reason */}
              <form onSubmit={handleExecuteComplaint} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jelaskan Kendala Produk / Alasan Komplain:
                  </label>
                  <textarea
                    rows={3}
                    value={complaintReason}
                    onChange={(e) => setComplaintReason(e.target.value)}
                    placeholder="Contoh: Botol madu pecah saat unboxing / varian yang dikirim salah..."
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isSubmittingComplaint}
                    onClick={() => setShowComplaintModal(false)}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingComplaint}
                    className="w-full h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-60"
                  >
                    {isSubmittingComplaint ? (
                      <>
                        <CircleNotch size={13} className="animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <ChatCircleDots size={14} weight="fill" />
                        <span>Kirim & Hubungi CS</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
          <CircleNotch className="animate-spin text-primary-green" size={28} />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
