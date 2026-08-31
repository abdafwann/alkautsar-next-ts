'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { Clock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function PaymentPendingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch('/api/payment/' + orderId);
        const data = await res.json();
        if (data.success) {
          setOrderData(data.order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (!orderData?.paymentExpiry) return;

    const expiryTime = new Date(orderData.paymentExpiry).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setTimeLeft('00:00:00');
        toast.error('Waktu pembayaran telah habis!');
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
  }, [orderData?.paymentExpiry]);

  const formatRupiah = (amount: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const handleBayarSekarang = () => {
    if (!orderData?.snapToken) {
      toast.error('Token pembayaran tidak ditemukan');
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
        },
        onError: function () {
          toast.error('Pembayaran gagal!');
          setIsPaymentLoading(false);
        },
        onClose: function () {
          toast.error('Anda menutup popup pembayaran');
          setIsPaymentLoading(false);
        },
      });
    } else {
      toast.error('Modul pembayaran belum siap. Silakan refresh halaman.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Pending Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Menunggu Pembayaran
          </h1>
          <p className="text-gray-600">
            Selesaikan pembayaran sebelum waktu habis untuk memproses pesanan Anda.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="text-center">
            <p className="text-sm font-medium opacity-90 mb-2">
              Sisa Waktu Pembayaran
            </p>
            <div className="text-5xl font-bold tracking-tight font-mono">
              {timeLeft || '--:--:--'}
            </div>
          </div>
        </div>

        {/* Order Info Card */}
        {orderData && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">ID Pesanan</span>
              <span className="font-mono font-semibold text-gray-900">
                {orderId}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Pembayaran</span>
                <span className="font-bold text-primary-green">
                  {formatRupiah(orderData.paymentAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status Pembayaran</span>
                <span className="font-medium text-amber-600">Menunggu</span>
              </div>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handleBayarSekarang}
          disabled={isPaymentLoading}
          className="w-full bg-primary-green hover:bg-primary-green-hover text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mb-4"
        >
          {isPaymentLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Membuka Metode Pembayaran...
            </>
          ) : (
            <>
              Bayar Sekarang
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Info Card */}
        <div className="bg-amber-50 rounded-2xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Penting!</p>
              <p>
                Pembayaran akan dikonfirmasi otomatis setelah transfer berhasil.
                Tidak perlu mengunggah bukti pembayaran.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="block w-full text-center text-gray-500 hover:text-gray-700 py-2 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {/* Midtrans Snap Script */}
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  );
}
