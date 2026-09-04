'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import toast from 'react-hot-toast';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  WarningCircle,
  ShieldCheck
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface OrderData {
  orderId: string;
  paymentAmount: number | string;
  paymentExpiry?: string;
  snapToken?: string;
  orderStatus?: string;
  paymentStatus?: string;
}

function formatRupiah(amount: number | string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export default function PaymentPendingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const snapScriptUrl = isProd
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch('/api/payment/' + orderId);
      const data = await res.json();
      if (data.success && data.order) {
        setOrderData(data.order);
        if (data.order.paymentStatus === 'PAID') {
          toast.success('Pembayaran telah berhasil dikonfirmasi!');
          router.push(`/payment/${orderId}/success`);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();

    // Smart Adaptive Polling:
    // - Active during first 10 minutes only
    // - Fast polling (4s) for first 2 min, medium (15s) for next 8 min
    // - Pauses automatically when tab is in background (Page Visibility API)
    let elapsedMs = 0;
    let timeoutId: NodeJS.Timeout;

    const scheduleNextPoll = () => {
      if (orderData?.orderStatus === 'CANCELLED' || orderData?.paymentStatus === 'PAID') {
        return;
      }

      // Stop auto-polling after 10 minutes (600,000 ms) to prevent server exhaustion
      if (elapsedMs >= 10 * 60 * 1000) {
        return;
      }

      const delay = elapsedMs < 2 * 60 * 1000 ? 4000 : 15000;

      timeoutId = setTimeout(() => {
        if (!document.hidden) {
          fetchOrder();
        }
        elapsedMs += delay;
        scheduleNextPoll();
      }, delay);
    };

    scheduleNextPoll();

    // Re-check instantly when user switches back to this tab
    const handleVisibilityChange = () => {
      if (!document.hidden && orderData?.orderStatus !== 'CANCELLED' && orderData?.paymentStatus !== 'PAID') {
        fetchOrder();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchOrder, orderData?.orderStatus, orderData?.paymentStatus]);

  // Countdown timer
  useEffect(() => {
    if (!orderData?.paymentExpiry || orderData.orderStatus === 'CANCELLED' || orderData.paymentStatus === 'PAID') {
      return;
    }

    const expiryTime = new Date(orderData.paymentExpiry).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setTimeLeft('00:00:00');
        return;
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
  }, [orderData?.paymentExpiry, orderData?.orderStatus, orderData?.paymentStatus]);

  const isCancelled = orderData?.orderStatus === 'CANCELLED';
  const isPaid = orderData?.paymentStatus === 'PAID';

  const handleBayarSekarang = () => {
    if (isCancelled) {
      toast.error('Pesanan telah dibatalkan.');
      return;
    }

    if (!orderData?.snapToken) {
      toast.error('Token pembayaran tidak ditemukan. Silakan muat ulang halaman.');
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
          toast.success('Menunggu penyelesaian pembayaran.');
          setIsPaymentLoading(false);
        },
        onError: function () {
          toast.error('Pembayaran gagal atau dibatalkan.');
          setIsPaymentLoading(false);
        },
        onClose: function () {
          toast.error('Jendela pembayaran ditutup.');
          setIsPaymentLoading(false);
        },
      });
    } else {
      toast.error('Modul pembayaran belum siap. Silakan coba sesaat lagi.');
    }
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen flex items-center justify-center p-4 py-8 md:py-12">
      <div className="max-w-xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-2xs text-center space-y-6">
          
          {/* Header & Pending/Cancelled Badge */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-3 shadow-2xs ${
              isCancelled
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : isPaid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              <Clock className="w-7 h-7" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              {isCancelled ? 'Pesanan Telah Dibatalkan' : isPaid ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {isCancelled
                ? 'Pesanan ini telah dibatalkan atau waktu pembayaran telah habis. Silakan buat pesanan baru.'
                : isPaid
                ? 'Pembayaran telah kami terima dan pesanan sedang disiapkan.'
                : 'Selesaikan pembayaran sebelum batas waktu berakhir agar pesanan Anda dapat segera kami proses.'}
            </p>
          </div>

          {/* Symmetrical Live Countdown Card (Only when waiting for payment) */}
          {!isCancelled && !isPaid && (
            <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 p-4 text-center shadow-2xs">
              <span className="text-xs font-medium text-amber-800 inline-flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-amber-600" />
                Sisa Waktu Pembayaran
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-amber-700 py-0.5">
                {timeLeft || '--:--:--'}
              </div>
            </div>
          )}

          {/* Cancelled Banner */}
          {isCancelled && (
            <div className="bg-rose-50/70 rounded-xl border border-rose-200 p-4 text-center shadow-2xs">
              <span className="text-xs font-bold text-rose-800 inline-flex items-center gap-1.5 mb-1">
                <WarningCircle size={15} className="text-rose-600" />
                Transaksi Dibatalkan / Kadaluarsa
              </span>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Stok produk dan kupon telah dikembalikan ke sistem.
              </p>
            </div>
          )}

          {/* Symmetrical Key-Value Receipt Card */}
          {orderData && (
            <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-4 md:p-5 text-xs divide-y divide-gray-200/70 space-y-0 text-left">
              {/* Row 1: ID Pesanan */}
              <div className="flex justify-between items-center pb-2.5">
                <span className="text-gray-500 font-medium">ID Pesanan</span>
                <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">
                  {orderId}
                </span>
              </div>

              {/* Row 2: Status Pembayaran */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-500 font-medium">Status Pembayaran</span>
                <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                  isCancelled
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : isPaid
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {isCancelled ? 'Dibatalkan' : isPaid ? 'Lunas' : 'Menunggu Pembayaran'}
                </span>
              </div>

              {/* Row 3: Total Pembayaran */}
              <div className="flex justify-between items-baseline pt-2.5">
                <span className="text-gray-900 font-bold">Total Pembayaran</span>
                <span className="font-mono font-black text-primary-green text-sm sm:text-base">
                  {formatRupiah(orderData.paymentAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Information Notice */}
          {!isCancelled && (
            <div className="bg-amber-50/60 rounded-xl border border-amber-100 p-3.5 flex gap-3 text-left text-xs">
              <WarningCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-amber-900 space-y-0.5">
                <p className="font-semibold">Konfirmasi Otomatis</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Pembayaran otomatis dikonfirmasi secara instan setelah transfer berhasil. Anda tidak perlu mengunggah bukti pembayaran manual.
                </p>
              </div>
            </div>
          )}

          {/* Action CTAs using Design System Button */}
          <div className="space-y-2.5 pt-1">
            {!isCancelled && !isPaid ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full h-11 text-xs font-bold rounded-lg shadow-2xs"
                  onClick={handleBayarSekarang}
                  isLoading={isPaymentLoading}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Lanjutkan Pembayaran
                </Button>

                <button
                  onClick={fetchOrder}
                  className="w-full h-10 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs border border-gray-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-primary-green" />
                  <span>Periksa Status Pembayaran</span>
                </button>
              </>
            ) : isCancelled ? (
              <Link
                href="/store"
                className="w-full h-11 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Belanja Kembali</span>
                <ArrowRight size={14} />
              </Link>
            ) : null}

            <Link
              href="/"
              className="w-full h-10 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs border border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          {/* Trust Footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            <ShieldCheck size={13} className="text-primary-green" />
            <span>Transaksi Resmi & Terenkripsi Aman</span>
          </div>

        </div>
      </div>

      {/* Midtrans Snap Script */}
      <Script
        src={snapScriptUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  );
}
