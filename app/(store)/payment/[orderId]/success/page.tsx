'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ArrowRight,
  Loader2,
  Truck,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  MapPin
} from 'lucide-react';
import { syncPaymentStatus } from '@/app/actions/order';

interface OrderItem {
  id: string;
  count: number;
  price: number;
  product: {
    title: string;
  };
}

interface OrderDetail {
  orderId: string;
  guestName?: string;
  guestEmail?: string;
  trackEmail?: string;
  userId?: string | null;
  isMember?: boolean;
  isOwner?: boolean;
  paymentAmount?: number;
  shippingCity?: string;
  shippingProvince?: string;
  orderItems?: OrderItem[];
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderInfo, setOrderInfo] = useState<OrderDetail | null>(null);

  useEffect(() => {
    const verifyAndFetch = async () => {
      try {
        if (orderId) {
          // 1. Trigger live payment verification
          await syncPaymentStatus(orderId);

          // 2. Fetch order metadata to check Member vs Guest status
          const res = await fetch(`/api/payment/${orderId}`);
          const data = await res.json();
          if (data.success && data.order) {
            setOrderInfo(data.order);
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    if (orderId) {
      verifyAndFetch();
    }
  }, [orderId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary-green mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-500">Memverifikasi status pembayaran...</p>
        </div>
      </div>
    );
  }

  // Dynamic Routing & Privacy Logic:
  // - If Member -> /account/orders
  // - If Guest Owner -> /track-order?orderId=...&email=... (autofill)
  // - If Guest Non-Owner -> /track-order?orderId=... (requires email input)
  const isMember = Boolean(orderInfo?.isMember || orderInfo?.userId);
  const guestEmail = orderInfo?.guestEmail || '';
  const trackEmail = orderInfo?.trackEmail || (guestEmail && !guestEmail.includes('***') ? guestEmail : '');
  const totalAmount = orderInfo?.paymentAmount || 0;
  const destination = [orderInfo?.shippingCity, orderInfo?.shippingProvince].filter(Boolean).join(', ');

  const trackOrderUrl = isMember
    ? '/account/orders'
    : trackEmail
    ? `/track-order?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(trackEmail)}`
    : `/track-order?orderId=${encodeURIComponent(orderId)}`;

  return (
    <div className="bg-[#fcfbf9] min-h-screen flex items-center justify-center p-4 py-8 md:py-12">
      <div className="max-w-xl w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-2xs text-center space-y-6">
          
          {/* Continuous Living Checkmark Animation */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-20 h-20 mb-3">
              
              {/* Continuous Ambient Ripple Ring */}
              <div className="ambient-pulse-ring absolute inset-0 rounded-full border-2 border-emerald-400"></div>

              {/* Expanding & Continuously Breathing Badge */}
              <div className="living-check-badge relative w-16 h-16 rounded-full bg-gradient-to-tr from-primary-green to-emerald-500 flex items-center justify-center">
                {/* SVG Checkmark that draws from center dot */}
                <svg
                  className="w-8 h-8 text-white stroke-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    className="checkmark-draw-path"
                    d="M6 12.5L10.5 17L18.5 7.5"
                  />
                </svg>
              </div>

            </div>

            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Pembayaran Berhasil
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Pembayaran berhasil dikonfirmasi. Paket segera kami kemas dan kirimkan ke alamat tujuan.
            </p>
          </div>

          {/* 100% Symmetrical Key-Value Receipt Card */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-4 md:p-5 text-xs divide-y divide-gray-200/70 space-y-0">
            
            {/* Row 1: ID Pesanan */}
            <div className="flex justify-between items-center pb-2.5">
              <span className="text-gray-500 font-medium">ID Pesanan</span>
              <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">{orderId}</span>
            </div>

            {/* Row 2: Status Pembayaran */}
            <div className="flex justify-between items-center py-2.5">
              <span className="text-gray-500 font-medium">Status Pembayaran</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[11px]">
                Lunas (PAID)
              </span>
            </div>

            {/* Row 3: Tipe Pelanggan */}
            <div className="flex justify-between items-center py-2.5">
              <span className="text-gray-500 font-medium">Tipe Pelanggan</span>
              <span className="font-medium text-gray-800 inline-flex items-center gap-1 text-xs">
                {isMember ? (
                  <>
                    <UserCheck size={12} className="text-primary-green" />
                    <span>Member Terdaftar</span>
                  </>
                ) : (
                  <span>Guest ({guestEmail || 'Tamu'})</span>
                )}
              </span>
            </div>

            {/* Row 4: Tujuan Pengiriman */}
            {destination && (
              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-500 font-medium">Tujuan Pengiriman</span>
                <span className="font-medium text-gray-800 inline-flex items-center gap-1 text-xs text-right">
                  <MapPin size={12} className="text-gray-400 shrink-0" />
                  <span>{destination}</span>
                </span>
              </div>
            )}

            {/* Row 5: Total Pembayaran */}
            {totalAmount > 0 && (
              <div className="flex justify-between items-baseline pt-2.5">
                <span className="text-gray-900 font-bold">Total Pembayaran</span>
                <span className="font-mono font-black text-primary-green text-sm sm:text-base">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            )}

          </div>

          {/* Shipping Notice */}
          <div className="bg-blue-50/60 rounded-xl border border-blue-100 p-3.5 flex gap-3 text-left text-xs">
            <Truck size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-blue-900 space-y-0.5">
              <p className="font-semibold">Notifikasi & Resi Pengiriman</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Nomor resi otomatis dikirimkan ke Email Anda segera setelah paket diserahkan ke kurir.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            <Link
              href={trackOrderUrl}
              className="w-full h-11 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-[0.99]"
            >
              <span>{isMember ? 'Lihat di Pesanan Saya' : 'Lacak Status Pesanan'}</span>
              <ArrowRight size={14} />
            </Link>

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

      {/* Living Animation Keyframes */}
      <style jsx global>{`
        @keyframes dotExpandAndBreathe {
          0% {
            transform: scale(0.15);
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
          35% {
            transform: scale(0.3);
            opacity: 1;
          }
          75% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
          }
        }

        @keyframes infiniteBreathing {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.3);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 14px 28px -2px rgba(16, 185, 129, 0.45);
          }
        }

        @keyframes continuousRipple {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.25;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes drawCheckmark {
          0% {
            stroke-dashoffset: 26;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        .living-check-badge {
          animation: 
            dotExpandAndBreathe 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
            infiniteBreathing 2.8s 0.7s ease-in-out infinite;
        }

        .ambient-pulse-ring {
          animation: continuousRipple 2.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        .checkmark-draw-path {
          stroke-dasharray: 26;
          stroke-dashoffset: 26;
          animation: drawCheckmark 0.5s 0.38s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
      `}</style>
    </div>
  );
}
