'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, TrendingUp } from 'lucide-react';

import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

export interface SalesDataPoint {
  date: string;
  label: string;
  sales: number;
}

export type PeriodKey = 'Bulan Ini' | '7 Hari Terakhir' | '30 Hari Terakhir' | 'Tahun Ini';

export interface PeriodSalesData {
  'Bulan Ini': SalesDataPoint[];
  '7 Hari Terakhir': SalesDataPoint[];
  '30 Hari Terakhir': SalesDataPoint[];
  'Tahun Ini': SalesDataPoint[];
}

interface MonthlySalesChartProps {
  periodsData?: PeriodSalesData;
  initialData?: SalesDataPoint[];
}

const DEFAULT_PERIODS_DATA: PeriodSalesData = {
  'Bulan Ini': [
    { date: '1-5 Agu', label: '1 - 5 Agustus 2026', sales: 2400000 },
    { date: '6-10 Agu', label: '6 - 10 Agustus 2026', sales: 3100000 },
    { date: '11-15 Agu', label: '11 - 15 Agustus 2026', sales: 4800000 },
    { date: '16-20 Agu', label: '16 - 20 Agustus 2026', sales: 2900000 },
    { date: '21-25 Agu', label: '21 - 25 Agustus 2026', sales: 5400000 },
    { date: '26-29 Agu', label: '26 - 29 Agustus 2026', sales: 4200000 },
  ],
  '7 Hari Terakhir': [
    { date: 'Min 23', label: 'Minggu, 23 Agu 2026', sales: 850000 },
    { date: 'Sen 24', label: 'Senin, 24 Agu 2026', sales: 1200000 },
    { date: 'Sel 25', label: 'Selasa, 25 Agu 2026', sales: 950000 },
    { date: 'Rab 26', label: 'Rabu, 26 Agu 2026', sales: 1650000 },
    { date: 'Kam 27', label: 'Kamis, 27 Agu 2026', sales: 1400000 },
    { date: 'Jum 28', label: 'Jumat, 28 Agu 2026', sales: 2100000 },
    { date: 'Sab 29', label: 'Sabtu, 29 Agu 2026', sales: 1850000 },
  ],
  '30 Hari Terakhir': [
    { date: '1-5 Hari', label: 'Hari ke 1 - 5', sales: 3200000 },
    { date: '6-10 Hari', label: 'Hari ke 6 - 10', sales: 4100000 },
    { date: '11-15 Hari', label: 'Hari ke 11 - 15', sales: 5800000 },
    { date: '16-20 Hari', label: 'Hari ke 16 - 20', sales: 3900000 },
    { date: '21-25 Hari', label: 'Hari ke 21 - 25', sales: 6200000 },
    { date: '26-30 Hari', label: 'Hari ke 26 - 30', sales: 5500000 },
  ],
  'Tahun Ini': [
    { date: 'Jan', label: 'Januari 2026', sales: 4200000 },
    { date: 'Feb', label: 'Februari 2026', sales: 5800000 },
    { date: 'Mar', label: 'Maret 2026', sales: 10500000 },
    { date: 'Apr', label: 'April 2026', sales: 4800000 },
    { date: 'Mei', label: 'Mei 2026', sales: 9800000 },
    { date: 'Jun', label: 'Juni 2026', sales: 6200000 },
    { date: 'Jul', label: 'Juli 2026', sales: 6500000 },
    { date: 'Agu', label: 'Agustus 2026', sales: 12800000 },
    { date: 'Sep', label: 'September 2026', sales: 9000000 },
    { date: 'Okt', label: 'Oktober 2026', sales: 14500000 },
    { date: 'Nov', label: 'November 2026', sales: 10200000 },
    { date: 'Des', label: 'Desember 2026', sales: 15500000 },
  ],
};

function formatRupiahFull(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRupiahShort(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${value}`;
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as SalesDataPoint;
    const value = payload[0].value || 0;
    return (
      <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-gray-100 text-xs">
        <p className="font-semibold text-gray-500 mb-1">{dataPoint.label || label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-medium text-gray-600">Total Penjualan:</span>
          <span className="font-bold text-gray-900 text-sm tabular-nums">
            {formatRupiahFull(value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SalesTrafficChart({ periodsData, initialData }: MonthlySalesChartProps) {
  const { t, locale } = useAdminLanguage();
  const [dateRange, setDateRange] = useState<PeriodKey>('Bulan Ini');

  // Select the active dataset based on selected period
  const activePeriodsData = periodsData || DEFAULT_PERIODS_DATA;
  const currentChartData = activePeriodsData[dateRange] || activePeriodsData['Bulan Ini'] || initialData || [];

  // Calculate sum total for the active selected period
  const totalPeriodSales = currentChartData.reduce((acc, curr) => acc + curr.sales, 0);

  const getPeriodLabel = (p: PeriodKey) => {
    if (locale === 'EN') {
      if (p === 'Bulan Ini') return 'This Month';
      if (p === '7 Hari Terakhir') return 'Last 7 Days';
      if (p === '30 Hari Terakhir') return 'Last 30 Days';
      if (p === 'Tahun Ini') return 'This Year';
    }
    return p;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all">
      {/* Header dengan Judul & Filter Terintegrasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">
              {locale === 'EN' ? `Sales Analytics (${getPeriodLabel(dateRange)})` : `Grafik Penjualan (${dateRange})`}
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp size={12} />
              <span>Realtime</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {locale === 'EN' ? 'Total revenue this period:' : 'Total omset periode ini:'} <span className="font-bold text-gray-800">{formatRupiahFull(totalPeriodSales)}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend Indikator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>{locale === 'EN' ? 'Sales' : 'Penjualan'}</span>
          </div>

          {/* Filter Rentang Waktu Terintegrasi */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as PeriodKey)}
              className="appearance-none bg-gray-50/90 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="Bulan Ini">{locale === 'EN' ? 'Period: This Month' : 'Periode: Bulan Ini'}</option>
              <option value="7 Hari Terakhir">{locale === 'EN' ? 'Period: Last 7 Days' : 'Periode: 7 Hari Terakhir'}</option>
              <option value="30 Hari Terakhir">{locale === 'EN' ? 'Period: Last 30 Days' : 'Periode: 30 Hari Terakhir'}</option>
              <option value="Tahun Ini">{locale === 'EN' ? 'Period: This Year' : 'Periode: Tahun Ini'}</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Area Chart Container dengan Animasi Perpindahan Data */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={dateRange} // Re-render animation smoothly when period changes
            data={currentChartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              {/* Sales Gradient (Emerald Green) */}
              <linearGradient id="salesEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(val) => formatRupiahShort(val)}
              width={75}
            />

            <Tooltip content={<CustomChartTooltip />} />

            {/* Single Area: Penjualan */}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesEmeraldGradient)"
              isAnimationActive={true}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
