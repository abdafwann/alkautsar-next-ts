import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const [productCount, categoryCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count()
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas toko Alkautsar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Produk" 
          value={productCount.toString()} 
          icon={<Package size={24} />} 
          color="bg-blue-50 text-blue-600"
        />
        <DashboardCard 
          title="Total Kategori" 
          value={categoryCount.toString()} 
          icon={<TrendingUp size={24} />} 
          color="bg-purple-50 text-purple-600"
        />
        <DashboardCard 
          title="Total Pesanan" 
          value="0" 
          icon={<ShoppingCart size={24} />} 
          color="bg-green-50 text-green-600"
        />
        <DashboardCard 
          title="Pelanggan" 
          value="0" 
          icon={<Users size={24} />} 
          color="bg-amber-50 text-amber-600"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
