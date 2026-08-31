'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

export interface RecentTransactionItem {
  id: string;
  orderId: string;
  customerName: string;
  paymentStatus: 'PAID' | 'UNPAID' | 'PENDING' | 'FAILED' | 'EXPIRED' | string;
  paymentMethod: string;
  shippingStatus: 'WAITING_FOR_PAYMENT' | 'PROCESSING' | 'PREPARING' | 'IN_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | string;
  discountApplied: string;
  date: string;
  amount: number;
}

interface RecentTransactionsTableProps {
  orders: RecentTransactionItem[];
}

function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

const DEFAULT_TRANSACTIONS: RecentTransactionItem[] = [
  {
    id: '1',
    orderId: 'INV-20260801',
    customerName: 'Budi Santoso',
    paymentStatus: 'PAID',
    paymentMethod: 'BCA Virtual Account',
    shippingStatus: 'DELIVERED',
    discountApplied: 'HERBAL10',
    date: '28 Agu 2026',
    amount: 185000,
  },
  {
    id: '2',
    orderId: 'INV-20260802',
    customerName: 'Siti Rahmawati',
    paymentStatus: 'PENDING',
    paymentMethod: 'QRIS',
    shippingStatus: 'PROCESSING',
    discountApplied: '-',
    date: '28 Agu 2026',
    amount: 240000,
  },
  {
    id: '3',
    orderId: 'INV-20260803',
    customerName: 'Ahmad Fauzi',
    paymentStatus: 'PAID',
    paymentMethod: 'Mandiri VA',
    shippingStatus: 'IN_DELIVERY',
    discountApplied: '-',
    date: '27 Agu 2026',
    amount: 320000,
  },
  {
    id: '4',
    orderId: 'INV-20260804',
    customerName: 'Dewi Lestari',
    paymentStatus: 'PAID',
    paymentMethod: 'GoPay',
    shippingStatus: 'PREPARING',
    discountApplied: 'KAUTSAR5',
    date: '27 Agu 2026',
    amount: 150000,
  },
  {
    id: '5',
    orderId: 'INV-20260805',
    customerName: 'Hendra Wijaya',
    paymentStatus: 'FAILED',
    paymentMethod: 'Kartu Kredit',
    shippingStatus: 'CANCELLED',
    discountApplied: '-',
    date: '26 Agu 2026',
    amount: 410000,
  },
];

export default function RecentTransactionsTable({
  orders,
}: RecentTransactionsTableProps) {
  const { t, locale } = useAdminLanguage();
  const transactions = orders && orders.length > 0 ? orders : DEFAULT_TRANSACTIONS;

  const renderPaymentStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PAID') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          {locale === 'EN' ? 'Paid' : 'Lunas'}
        </span>
      );
    }
    if (s === 'PENDING' || s === 'UNPAID') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
          {locale === 'EN' ? 'Pending' : 'Menunggu'}
        </span>
      );
    }
    if (s === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {locale === 'EN' ? 'Expired' : 'Kedaluwarsa'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
        {locale === 'EN' ? 'Failed' : 'Gagal'}
      </span>
    );
  };

  const renderShippingStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          {locale === 'EN' ? 'Delivered' : 'Terkirim'}
        </span>
      );
    }
    if (s === 'IN_DELIVERY') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {locale === 'EN' ? 'In Delivery' : 'Dalam Pengiriman'}
        </span>
      );
    }
    if (s === 'PROCESSING') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
          {locale === 'EN' ? 'Processing' : 'Sedang Diproses'}
        </span>
      );
    }
    if (s === 'PREPARING') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
          {locale === 'EN' ? 'Preparing' : 'Sedang Dikemas'}
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
          {locale === 'EN' ? 'Cancelled' : 'Dibatalkan'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        {locale === 'EN' ? 'Pending' : 'Menunggu'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">{t('recentTransactionsTitle')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('recentTransactionsSubtitle')}</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-primary-green hover:underline flex items-center gap-0.5"
        >
          {t('viewAll')}
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-semibold">
              <th className="w-[14%] pb-3 pr-4 font-semibold">{locale === 'EN' ? 'Order ID' : 'ID Pesanan'}</th>
              <th className="w-[16%] pb-3 pr-4 font-semibold">{locale === 'EN' ? 'Customer' : 'Nama Pelanggan'}</th>
              <th className="w-[13%] pb-3 pr-4 font-semibold">{locale === 'EN' ? 'Payment' : 'Status Bayar'}</th>
              <th className="w-[14%] pb-3 pr-4 font-semibold">{locale === 'EN' ? 'Method' : 'Metode Bayar'}</th>
              <th className="w-[14%] pb-3 pr-4 font-semibold">{locale === 'EN' ? 'Shipping' : 'Pengiriman'}</th>
              <th className="w-[11%] pb-3 pr-4 font-semibold text-center">{locale === 'EN' ? 'Coupon' : 'Kupon'}</th>
              <th className="w-[10%] pb-3 pr-4 font-semibold">{locale === 'EN' ? 'Date' : 'Tanggal'}</th>
              <th className="w-[8%] pb-3 font-semibold text-right">{locale === 'EN' ? 'Total' : 'Total'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-gray-50/60 transition-colors group cursor-pointer"
                onClick={() => {
                  window.location.href = `/admin/orders`;
                }}
              >
                <td className="py-3.5 pr-4 font-semibold text-gray-900 tabular-nums">
                  {tx.orderId}
                </td>
                <td className="py-3.5 pr-4 text-gray-800 font-medium">
                  {tx.customerName}
                </td>
                <td className="py-3.5 pr-4">
                  {renderPaymentStatusBadge(tx.paymentStatus)}
                </td>
                <td className="py-3.5 pr-4 text-gray-600 font-medium capitalize">
                  {tx.paymentMethod}
                </td>
                <td className="py-3.5 pr-4">
                  {renderShippingStatusBadge(tx.shippingStatus)}
                </td>
                <td className="py-3.5 pr-4 text-center text-gray-500 font-mono text-[11px]">
                  {tx.discountApplied || '-'}
                </td>
                <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">
                  {tx.date}
                </td>
                <td className="py-3.5 text-right font-bold text-gray-900 tabular-nums">
                  {formatRupiah(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
