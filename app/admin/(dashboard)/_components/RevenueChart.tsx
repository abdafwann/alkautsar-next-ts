'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartPoint {
  name: string;
  total: number;
}

interface RevenueChartProps {
  data?: ChartPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#122b1c] text-white p-3 rounded-xl shadow-xl border border-white/10">
        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-extrabold text-white">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Sen', total: 0 },
    { name: 'Sel', total: 0 },
    { name: 'Rab', total: 0 },
    { name: 'Kam', total: 0 },
    { name: 'Jum', total: 0 },
    { name: 'Sab', total: 0 },
    { name: 'Min', total: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 5,
          left: -20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e5e2db" />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }}
          dy={8}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#a8a29e' }}
          tickFormatter={(value) => (value >= 1000000 ? `${(value / 1000000).toFixed(1)}jt` : value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`)}
          width={55}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(0, 170, 91, 0.04)' }}
        />
        <Bar 
          dataKey="total" 
          fill="#1f422e" 
          radius={[4, 4, 0, 0]}
          barSize={14}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
