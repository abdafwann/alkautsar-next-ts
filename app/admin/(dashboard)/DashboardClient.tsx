'use client';

import React from 'react';
import SparklineMetricCard from './_components/SparklineMetricCard';
import SalesTrafficChart, { PeriodSalesData } from './_components/SalesTrafficChart';
import LowStockAlertsCard, { LowStockProductItem } from './_components/LowStockAlertsCard';
import RecentTransactionsTable, { RecentTransactionItem } from './_components/RecentTransactionsTable';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

interface DashboardClientProps {
  totalRevenue: number;
  activeOrdersCount: number;
  conversionRate: string;
  totalCustomersCount: number;
  periodsData: PeriodSalesData;
  formattedLowStock: LowStockProductItem[];
  formattedRecentTransactions: RecentTransactionItem[];
}

function formatRupiah(amount: number | null | undefined): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function DashboardClient({
  totalRevenue,
  activeOrdersCount,
  conversionRate,
  totalCustomersCount,
  periodsData,
  formattedLowStock,
  formattedRecentTransactions,
}: DashboardClientProps) {
  const { t, locale } = useAdminLanguage();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Judul Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboardTitle')}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('dashboardSubtitle')}
          </p>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama dengan Sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SparklineMetricCard
          title={t('metricTotalSales')}
          value={totalRevenue > 0 ? formatRupiah(totalRevenue) : 'Rp 12.450.000'}
          change="8.5%"
          isPositive={true}
          colorScheme="green"
          sparklineData={[12, 18, 14, 25, 22, 38, 32, 45, 40, 52]}
        />
        <SparklineMetricCard
          title={t('metricActiveOrders')}
          value={activeOrdersCount > 0 ? activeOrdersCount.toLocaleString(locale === 'EN' ? 'en-US' : 'id-ID') : '4,520'}
          change="5.2%"
          isPositive={true}
          colorScheme="blue"
          sparklineData={[20, 24, 18, 30, 28, 42, 36, 48, 44, 56]}
        />
        <SparklineMetricCard
          title={t('metricConversionRate')}
          value={`${conversionRate}%`}
          change="0.4%"
          isPositive={true}
          colorScheme="orange"
          sparklineData={[15, 22, 19, 28, 25, 35, 30, 40, 34, 45]}
        />
        <SparklineMetricCard
          title={t('metricTotalCustomers')}
          value={totalCustomersCount > 0 ? totalCustomersCount.toLocaleString(locale === 'EN' ? 'en-US' : 'id-ID') : '78'}
          change="2.1%"
          isPositive={false}
          colorScheme="purple"
          sparklineData={[35, 32, 28, 30, 26, 24, 28, 22, 25, 20]}
        />
      </div>

      {/* Baris Tengah: Grafik Penjualan Bulanan (8 Kolom) + Peringatan Stok Menipis (4 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SalesTrafficChart periodsData={periodsData} />
        </div>
        <div className="lg:col-span-4">
          <LowStockAlertsCard products={formattedLowStock} />
        </div>
      </div>

      {/* Baris Bawah: Tabel Transaksi Terbaru */}
      <div className="w-full">
        <RecentTransactionsTable orders={formattedRecentTransactions} />
      </div>
    </div>
  );
}
