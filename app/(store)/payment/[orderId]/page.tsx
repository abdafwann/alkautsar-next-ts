'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Clock,
  Package,
  CaretRight,
  ArrowLeft,
  CircleNotch,
  WarningCircle,
  ShieldCheck,
  CreditCard,
  MapPin
} from '@phosphor-icons/react';

interface OrderData {
  orderId: string;
  guestName: string;
  guestEmail: string;
  shippingName: string;
  shippingMobile: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  paymentAmount: string | number;
  paymentExpiry: string;
  snapToken: string;
  orderStatus: string;
  paymentStatus: string;
  orderItems: Array<{
    id: string;
    count: number;
    price: string | number;
    product: {
      title: string;
      images: Array<{ url: string }>;
    };
  }>;
}

function formatRupiah(amount: string | number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(amount));
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapScriptUrl = isProd
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch('/api/payment/' + orderId);
        const data = await res.json();

        if (data.success && data.order) {
          setOrderData(data.order);
        } else {
          toast.error(data.error || 'Gagal memuat data pesanan');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Gagal memuat data pesanan');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  // Countdown timer calculation
  useEffect(() => {
    if (!orderData?.paymentExpiry) return;

    const expiryTime = new Date(orderData.paymentExpiry).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setTimeLeft('00:00:00');
        setIsExpired(true);
        return;
      }

      if (remaining <= 60 * 60 * 1000) {
        setIsUrgent(true);
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [orderData?.paymentExpiry]);

  const handleBayarSekarang = () => {
    if (isExpired) {
      toast.error('Batas waktu pembayaran telah habis');
      return;
    }

    if (!orderData?.snapToken) {
      toast.error('Token pembayaran tidak ditemukan. Silakan refresh halaman.');
      return;
    }

    // @ts-ignore
    if (window.snap) {
      setIsPaymentLoading(true);
      // @ts-ignore
      window.snap.pay(orderData.snapToken, {
        onSuccess: function () {
          toast.success('Pembayaran berhasil!');
          router.push(`/payment/${orderId}/success`);
        },
        onPending: function () {
          toast.success('Menunggu pembayaran!');
          router.push(`/payment/${orderId}/pending`);
        },
        onError: function () {
          toast.error('Pembayaran gagal!');
          setIsPaymentLoading(false);
        },
        onClose: function () {
          toast.error('Jendela pembayaran ditutup');
          setIsPaymentLoading(false);
        },
      });
    } else {
      toast.error('Modul pembayaran sedang dimuat. Silakan coba 1 detik lagi.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
        <div className="text-center">
          <CircleNotch className="w-7 h-7 animate-spin text-primary-green mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-500">Memuat detail pesanan Anda...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-2xs max-w-sm w-full">
          <p className="text-sm font-semibold text-gray-800 mb-4">Data pesanan tidak ditemukan</p>
          <Link
            href="/"
            className="inline-block bg-primary-green text-white font-semibold px-5 py-2.5 rounded-lg text-xs hover:bg-primary-green-hover transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isAlreadyPaid = orderData.paymentStatus === 'PAID';
  const isCancelled = orderData.orderStatus === 'CANCELLED';

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-sm font-bold text-gray-900">
              {isAlreadyPaid ? 'Status Pesanan' : isCancelled ? 'Pesanan Dibatalkan' : 'Detail Pembayaran'}
            </h1>
          </div>
          <span className="text-[11px] font-mono font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            {orderData.orderId}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* Status / Alert Banner */}
        {isAlreadyPaid ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-green shrink-0 mt-0.5" weight="fill" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">Pembayaran Berhasil Diterima</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Pesanan Anda telah lunas dan sedang disiapkan untuk pengiriman.
              </p>
            </div>
          </div>
        ) : isCancelled ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <WarningCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" weight="fill" />
            <div>
              <h2 className="text-sm font-bold text-rose-900">Pesanan Telah Dibatalkan</h2>
              <p className="text-xs text-red-700 mt-0.5">
                Transaksi ini telah dibatalkan atau kadaluarsa. Stok produk telah dikembalikan.
              </p>
              <Link
                href="/store"
                className="mt-3 inline-block bg-primary-green text-white font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-primary-green-hover transition"
              >
                Belanja Kembali
              </Link>
            </div>
          </div>
        ) : isExpired ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <WarningCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" weight="fill" />
            <div>
              <h2 className="text-sm font-bold text-red-900">Batas Waktu Pembayaran Telah Habis</h2>
              <p className="text-xs text-red-700 mt-0.5">
                Pesanan ini otomatis dibatalkan. Silakan buat pesanan baru dari katalog.
              </p>
              <Link
                href="/store"
                className="mt-3 inline-block bg-red-600 text-white font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-red-700 transition"
              >
                Belanja Kembali
              </Link>
            </div>
          </div>
        ) : null}

        {/* Live Countdown Card */}
        {!isAlreadyPaid && !isExpired && !isCancelled && (
          <div
            className={`rounded-xl p-4 text-center transition-colors border shadow-2xs ${
              isUrgent
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <span className="text-xs font-medium text-gray-500 inline-flex items-center gap-1.5 mb-1">
              <Clock size={13} className={isUrgent ? 'text-rose-600' : 'text-primary-green'} />
              {isUrgent ? 'Sisa Waktu Pembayaran (Mendesak)' : 'Sisa Waktu Pembayaran'}
            </span>
            <div
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono py-0.5 ${
                isUrgent ? 'text-rose-600' : 'text-primary-green'
              }`}
            >
              {timeLeft || '--:--:--'}
            </div>
          </div>
        )}

        {/* Invoice-Grade Order Summary */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider pb-2.5 border-b border-gray-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Package size={14} className="text-gray-400" />
              Rincian Produk
            </span>
            <span className="text-[11px] font-normal text-gray-400">
              {orderData.orderItems.length} Produk
            </span>
          </h3>

          <div className="space-y-2.5 divide-y divide-gray-50">
            {orderData.orderItems.map((item) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex justify-between items-start text-xs">
                <div className="flex-1 pr-3">
                  <p className="font-semibold text-gray-900 line-clamp-1">
                    {item.product?.title || 'Produk Herbal'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {item.count} x {formatRupiah(item.price)}
                  </p>
                </div>
                <span className="font-bold text-gray-900 font-mono shrink-0">
                  {formatRupiah(Number(item.price) * item.count)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
            <span className="text-xs font-bold text-gray-900">Total Pembayaran</span>
            <span className="text-lg font-black text-primary-green font-mono">
              {formatRupiah(orderData.paymentAmount)}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-2 text-xs">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400" />
            Tujuan Pengiriman
          </h3>
          <div className="text-gray-600 space-y-0.5 pt-1">
            <p className="font-bold text-gray-900">{orderData.shippingName}</p>
            <p>{orderData.shippingMobile}</p>
            <p className="text-gray-500">
              {orderData.shippingAddress}, {orderData.shippingCity}, {orderData.shippingProvince} {orderData.shippingPostalCode}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {!isAlreadyPaid && !isExpired && (
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleBayarSekarang}
              disabled={isPaymentLoading}
              className="w-full h-12 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all duration-150 shadow-2xs active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPaymentLoading ? (
                <>
                  <CircleNotch className="w-4 h-4 animate-spin" />
                  <span>Membuka Midtrans...</span>
                </>
              ) : (
                <>
                  <CreditCard size={15} />
                  <span>Bayar Sekarang</span>
                  <CaretRight size={15} />
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck size={13} className="text-primary-green" />
              <span>Mendukung QRIS, GoPay, ShopeePay, & Virtual Account Bank</span>
            </div>
          </div>
        )}

        {isAlreadyPaid && (
          <Link
            href="/account/orders"
            className="w-full h-11 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            Lihat Pesanan Saya
          </Link>
        )}

      </main>

      {/* Midtrans Snap Script */}
      <Script
        src={snapScriptUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  );
}
