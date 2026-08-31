import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminLanguageProvider } from '@/lib/i18n/AdminLanguageContext';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is required');
}

const key = new TextEncoder().encode(secretKey);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  let adminName = 'Admin';
  let adminEmail = 'admin@alkautsar.com';
  let adminRole = 'ADMIN';

  try {
    const verified = await jwtVerify(token, key);
    adminEmail = verified.payload.email as string;
    const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      redirect('/admin/login');
    }
    adminName = admin.name;
    adminRole = admin.role;
  } catch (e) {
    redirect('/admin/login');
  }

  // Fetch live operational counter badges in parallel
  const [pendingOrdersCount, unreadInquiriesCount, lowStockCount] = await Promise.all([
    prisma.order.count({
      where: {
        OR: [
          { orderStatus: { in: ['PROCESSING', 'PREPARING'] } },
          { paymentStatus: 'PAID', orderStatus: 'WAITING_FOR_PAYMENT' }
        ]
      }
    }).catch(() => 0),
    prisma.inquiry.count({
      where: { isRead: false }
    }).catch(() => 0),
    prisma.product.count({
      where: { quantity: { lte: 5 } }
    }).catch(() => 0),
  ]);

  return (
    <AdminLanguageProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Dynamic Animated Client Sidebar with Real-time Counter Badges */}
        <AdminSidebar 
          adminRole={adminRole} 
          badgeCounts={{
            orders: pendingOrdersCount,
            inquiries: unreadInquiriesCount,
            lowStock: lowStockCount,
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col ml-64 min-w-0">
          <AdminHeader adminName={adminName} adminEmail={adminEmail} />
          <main className="p-8 flex-1 bg-gray-50">{children}</main>
        </div>
      </div>
    </AdminLanguageProvider>
  );
}
