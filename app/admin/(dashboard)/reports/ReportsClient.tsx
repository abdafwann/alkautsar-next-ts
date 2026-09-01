'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getSalesReport, getTopProducts, exportOrdersToCSV } from '@/app/actions/admin-reports';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShoppingBag, 
  CreditCard, 
  Package, 
  Download, 
  Loader2, 
  RotateCcw,
  Calendar,
  Layers,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '@/lib/format';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';
import { AdminMetricCardsSkeleton, AdminChartSkeleton } from '@/components/admin/skeletons/AdminSkeletons';
import { Skeleton } from '@/components/ui/Skeleton';

interface SalesData {
  chartData: Array<{ name: string; revenue: number; orders: number }>;
  summary: {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    ordersGrowth: number;
    averageOrderValue: number;
    totalDiscounts?: number;
    paymentSuccessRate?: number;
  };
  paymentMethods?: Array<{ name: string; count: number; amount: number }>;
  topDestinations?: Array<{ province: string; orders: number; revenue: number }>;
  categoryBreakdown?: Array<{ category: string; soldCount: number; revenue: number }>;
}

interface TopProduct {
  id: string;
  title: string;
  image?: string | null;
  soldCount: number;
  revenue: number;
  stock?: number;
}

const DUMMY_SALES_DATA: SalesData = {
  chartData: [
    { name: 'Jan', revenue: 14500000, orders: 48 },
    { name: 'Feb', revenue: 16800000, orders: 55 },
    { name: 'Mar', revenue: 19200000, orders: 64 },
    { name: 'Apr', revenue: 22400000, orders: 78 },
    { name: 'Mei', revenue: 20100000, orders: 70 },
    { name: 'Jun', revenue: 24600000, orders: 85 },
    { name: 'Jul', revenue: 27800000, orders: 94 },
    { name: 'Agu', revenue: 31200000, orders: 110 },
    { name: 'Sep', revenue: 29500000, orders: 102 },
    { name: 'Okt', revenue: 34000000, orders: 118 },
    { name: 'Nov', revenue: 38500000, orders: 132 },
    { name: 'Des', revenue: 42000000, orders: 145 },
  ],
  summary: {
    revenue: 42000000,
    revenueGrowth: 9.1,
    orders: 145,
    ordersGrowth: 9.8,
    averageOrderValue: 289655,
    totalDiscounts: 3450000,
    paymentSuccessRate: 96.4,
  },
  paymentMethods: [
    { name: 'QRIS / GoPay / ShopeePay', count: 82, amount: 23500000 },
    { name: 'BCA & Mandiri Virtual Account', count: 46, amount: 14200000 },
    { name: 'Transfer Bank Manual', count: 12, amount: 3100000 },
    { name: 'Gerai Ritel (Indomaret/Alfamart)', count: 5, amount: 1200000 },
  ],
  topDestinations: [
    { province: 'Jawa Barat', orders: 58, revenue: 16820000 },
    { province: 'DKI Jakarta', orders: 42, revenue: 12450000 },
    { province: 'Jawa Timur', orders: 24, revenue: 7100000 },
    { province: 'Jawa Tengah', orders: 15, revenue: 4350000 },
    { province: 'Sumatera Utara', orders: 6, revenue: 1280000 },
  ],
  categoryBreakdown: [
    { category: 'Madu Murni & Propolis', soldCount: 245, revenue: 29400000 },
    { category: 'Habbatussauda & Jintan Hitam', soldCount: 312, revenue: 26520000 },
    { category: 'Minyak Zaitun', soldCount: 142, revenue: 13490000 },
    { category: 'Kapsul Herbal', soldCount: 188, revenue: 12220000 },
    { category: 'Sari Kurma', soldCount: 126, revenue: 6930000 },
  ]
};

const DUMMY_TOP_PRODUCTS: TopProduct[] = [
  {
    id: 'top-1',
    title: 'Minyak Habbatussauda Extra Virgin 100ml',
    soldCount: 312,
    revenue: 26520000,
    stock: 42,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'top-2',
    title: 'Madu Murni Randu Asli Al-Kautsar 500g',
    soldCount: 245,
    revenue: 29400000,
    stock: 4, // Low stock alert
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'top-3',
    title: 'Kapsul Daun Bidara Arab 60 Kapsul',
    soldCount: 188,
    revenue: 12220000,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'top-4',
    title: 'Minyak Zaitun Tursina Extra Virgin 250ml',
    soldCount: 142,
    revenue: 13490000,
    stock: 2, // Critical stock alert
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'top-5',
    title: 'Sari Kurma Angkak Plus Propolis 350g',
    soldCount: 126,
    revenue: 6930000,
    stock: 29,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=100&auto=format&fit=crop&q=80',
  },
];

export default function ReportsClient() {
  const { t, locale } = useAdminLanguage();
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isUsingDummy, setIsUsingDummy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [chartView, setChartView] = useState<'both' | 'revenue' | 'orders'>('both');

  const periodPresets = useMemo(() => [
    { id: 'this_month', label: t('chartPeriodThisMonth') },
    { id: '30d', label: t('chartPeriod30Days') },
    { id: '7d', label: t('chartPeriod7Days') },
    { id: 'today', label: locale === 'EN' ? 'Today' : 'Hari Ini' },
    { id: 'this_year', label: t('chartPeriodThisYear') },
    { id: 'custom', label: t('filterCustomDate') },
  ], [t, locale]);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);

    try {
      const [salesRes, productsRes] = await Promise.all([
        getSalesReport(),
        getTopProducts(),
      ]);

      let hasRealData = false;

      if (salesRes.success && salesRes.data) {
        const data = salesRes.data as SalesData;
        const hasRevenue = data.summary.revenue > 0 || data.chartData.some(d => d.revenue > 0);
        if (hasRevenue) {
          setSalesData(data);
          hasRealData = true;
        } else {
          setSalesData(DUMMY_SALES_DATA);
          setIsUsingDummy(true);
        }
      } else {
        setSalesData(DUMMY_SALES_DATA);
        setIsUsingDummy(true);
      }

      if (productsRes.success && productsRes.data && (productsRes.data as TopProduct[]).length > 0) {
        setTopProducts(productsRes.data as TopProduct[]);
      } else {
        setTopProducts(DUMMY_TOP_PRODUCTS);
      }

      if (hasRealData) {
        setIsUsingDummy(false);
      }
    } catch {
      setSalesData(DUMMY_SALES_DATA);
      setTopProducts(DUMMY_TOP_PRODUCTS);
      setIsUsingDummy(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await exportOrdersToCSV({
        startDate: selectedPeriod === 'custom' ? customStartDate : undefined,
        endDate: selectedPeriod === 'custom' ? customEndDate : undefined,
      });

      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `laporan-penjualan-alkautsar-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(locale === 'EN' ? 'Sales report CSV downloaded' : 'Laporan penjualan CSV berhasil diunduh');
      } else {
        toast.error(res.error || (locale === 'EN' ? 'Failed to export report' : 'Gagal mengekspor laporan'));
      }
    } catch {
      toast.error(locale === 'EN' ? 'Export failed due to system error' : 'Terjadi kesalahan saat mengekspor laporan');
    } finally {
      setIsExporting(false);
    }
  };

  const { chartData, summary, paymentMethods, topDestinations, categoryBreakdown } = salesData || DUMMY_SALES_DATA;

  // Annual total calculation
  const annualTotalRevenue = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [chartData]);

  // Payment totals for percentage
  const totalPaymentAmount = useMemo(() => {
    if (!paymentMethods || paymentMethods.length === 0) return summary.revenue || 1;
    return paymentMethods.reduce((acc, curr) => acc + curr.amount, 0) || 1;
  }, [paymentMethods, summary.revenue]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminMetricCardsSkeleton count={5} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AdminChartSkeleton />
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex flex-col justify-between h-80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="w-7 h-7 rounded-lg" />
            </div>
            <div className="space-y-3 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                    <div className="space-y-1 flex-1 min-w-0">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Preview Mode Notice if DB is empty */}
      {isUsingDummy && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span><strong>Mode Preview Dummy Data:</strong> Belum ada transaksi penjualan lunas di database. Menampilkan simulasi analitik finansial agar visualisasi performa dapat diuji.</span>
          </div>
          <button 
            onClick={fetchReports}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw size={12} /> Cek Ulang Database
          </button>
        </div>
      )}

      {/* 2. Top Filter & Export Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 font-semibold mr-1 flex items-center gap-1">
            <Calendar size={13} /> {t('filterPeriod')}:
          </span>
          {periodPresets.map((preset) => {
            const active = selectedPeriod === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPeriod(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Inputs if Custom selected */}
        {selectedPeriod === 'custom' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="h-8 text-xs rounded-lg"
              placeholder="Dari"
            />
            <span className="text-xs text-gray-400">s/d</span>
            <Input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="h-8 text-xs rounded-lg"
              placeholder="Sampai"
            />
          </div>
        )}

        {/* Quick Export Button */}
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          <span>{isExporting ? t('exporting') : t('exportCSV')}</span>
        </button>
      </div>

      {/* 3. Executive KPI Cards (5 Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* 1. Net Revenue */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 font-medium truncate">{t('totalRevenue')}</div>
            <div className="text-base font-bold text-gray-900 font-mono mt-0.5 truncate">
              {formatCurrency(summary.revenue)}
            </div>
            {summary.revenueGrowth !== 0 && (
              <div className={`flex items-center gap-0.5 text-[10px] font-bold mt-0.5 ${
                summary.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {summary.revenueGrowth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{Math.abs(summary.revenueGrowth)}% vs lalu</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 font-medium truncate">{t('completedOrders')}</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {summary.orders} <span className="text-xs font-normal text-gray-500">{t('orders')}</span>
            </div>
            {summary.ordersGrowth !== 0 && (
              <div className={`flex items-center gap-0.5 text-[10px] font-bold mt-0.5 ${
                summary.ordersGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {summary.ordersGrowth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{Math.abs(summary.ordersGrowth)}% vs lalu</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Average Order Value (AOV) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 font-medium truncate">{t('avgOrderValue')}</div>
            <div className="text-base font-bold text-gray-900 font-mono mt-0.5 truncate">
              {formatCurrency(summary.averageOrderValue)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Per order</div>
          </div>
        </div>

        {/* 4. Payment Conversion Rate */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 font-medium truncate">{t('successRate')}</div>
            <div className="text-base font-bold text-teal-700 mt-0.5">
              {summary.paymentSuccessRate || 100}%
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Payment ratio</div>
          </div>
        </div>

        {/* 5. Total Discount Subsidy */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Tag size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-400 font-medium truncate">{t('totalDiscountGiven')}</div>
            <div className="text-base font-bold text-purple-700 font-mono mt-0.5 truncate">
              {formatCurrency(summary.totalDiscounts || 0)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{t('vouchers')}</div>
          </div>
        </div>
      </div>

      {/* 4. Sales Curve Chart & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Sales Trend Chart */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t('salesTrendChartTitle')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{t('salesTrendChartSubtitle')}: <strong className="font-mono text-gray-800">{formatCurrency(annualTotalRevenue)}</strong></p>
            </div>

            {/* Chart View Mode Controls */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200/60">
              <button
                onClick={() => setChartView('both')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  chartView === 'both' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {locale === 'EN' ? 'Combined' : 'Gabungan'}
              </button>
              <button
                onClick={() => setChartView('revenue')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  chartView === 'revenue' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('metricRevenue')} (Rp)
              </button>
              <button
                onClick={() => setChartView('orders')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  chartView === 'orders' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('metricOrders')} (Qty)
              </button>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  dy={6}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={formatCompactCurrency}
                  width={55}
                />
                {(chartView === 'both' || chartView === 'orders') && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    width={35}
                  />
                )}
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                          <p className="font-bold text-gray-200">{label}</p>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                              <span className="text-gray-400 capitalize">{entry.name}:</span>
                              <strong className="font-mono text-white">
                                {entry.name === 'revenue' ? formatCurrency(entry.value as number) : `${entry.value} ${t('orders')}`}
                              </strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {(chartView === 'both' || chartView === 'revenue') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#059669' }}
                  />
                )}
                {(chartView === 'both' || chartView === 'orders') && (
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="none"
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> {t('metricRevenue')} (Rp)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> {t('metricOrders')}
              </span>
            </div>
            <span className="text-[11px] text-gray-400">{locale === 'EN' ? 'Auto-synced data' : 'Data terinkremental otomatis'}</span>
          </div>
        </div>

        {/* Top Selling Products with Warehouse Stock Alerts */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t('topSellingProductsTitle')}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('topSellingProductsSubtitle')}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Package size={14} />
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
              {topProducts.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  {locale === 'EN' ? 'No product sales data yet.' : 'Belum ada data penjualan produk.'}
                </div>
              ) : (
                topProducts.map((product, idx) => {
                  const isLowStock = product.stock !== undefined && product.stock <= 5;

                  return (
                    <div key={product.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={14} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-gray-900 truncate" title={product.title}>
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-emerald-600 font-medium">
                              {product.soldCount} {t('itemsSold')}
                            </span>
                            {product.stock !== undefined && (
                              <span className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                                isLowStock
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {t('lowStockRemaining')}: {product.stock}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-xs text-gray-900 font-mono block">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>{topProducts.length} {t('products').toLowerCase()}</span>
            <a href="/admin/products" className="text-primary-green font-semibold hover:underline flex items-center gap-0.5">
              {t('products')} <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* 5. Distribution Row: Payment Methods & Shipping Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment Channels Distribution */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t('paymentMethodsDistributionTitle')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{locale === 'EN' ? 'Customer checkout channel breakdown.' : 'Preferensi metode transaksi pelanggan.'}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard size={14} />
            </div>
          </div>

          <div className="space-y-3">
            {(paymentMethods || []).map((method, idx) => {
              const percentage = Math.round((method.amount / totalPaymentAmount) * 100) || 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700 truncate">{method.name}</span>
                    <span className="font-bold text-gray-900 font-mono">{percentage}% ({method.count})</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono text-right">
                    {formatCurrency(method.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Revenue Contribution */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t('categorySalesBreakdownTitle')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{locale === 'EN' ? 'Revenue share by product category.' : 'Omset berdasarkan kategori produk.'}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>

          <div className="space-y-3">
            {(categoryBreakdown || []).map((cat, idx) => {
              const percentage = Math.round((cat.revenue / (summary.revenue || 1)) * 100) || 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700 truncate">{cat.category}</span>
                    <span className="font-bold text-gray-900 font-mono">{cat.soldCount} {t('items')}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{percentage}% {locale === 'EN' ? 'of revenue' : 'dari omset'}</span>
                    <span className="font-mono text-gray-700 font-semibold">{formatCurrency(cat.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Shipping Destinations */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{t('topShippingDestinationsTitle')}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{locale === 'EN' ? 'Most frequent customer delivery provinces.' : 'Sebaran lokasi pemesan terbanyak.'}</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MapPin size={14} />
            </div>
          </div>

          <div className="space-y-2.5">
            {(topDestinations || []).map((dest, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80 border border-gray-100 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-gray-900 truncate">{dest.province}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-gray-900 block">{dest.orders} {t('orders')}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{formatCurrency(dest.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
