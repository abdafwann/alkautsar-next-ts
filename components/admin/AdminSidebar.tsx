'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Ticket, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  ClipboardList,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

export interface BadgeCounts {
  orders?: number;
  inquiries?: number;
  lowStock?: number;
}

interface AdminSidebarProps {
  adminRole: string;
  badgeCounts?: BadgeCounts;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  exact?: boolean;
}

interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

export default function AdminSidebar({ adminRole, badgeCounts }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useAdminLanguage();

  const navGroups: NavGroup[] = [
    {
      items: [
        { href: '/admin', label: t('dashboard'), icon: LayoutDashboard, exact: true },
      ]
    },
    {
      groupTitle: t('groupCatalog'),
      items: [
        { 
          href: '/admin/products', 
          label: t('products'), 
          icon: Package,
          badge: badgeCounts?.lowStock && badgeCounts.lowStock > 0 
            ? (badgeCounts.lowStock > 99 ? '99+' : badgeCounts.lowStock) 
            : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
        { href: '/admin/categories', label: t('categories'), icon: Tags },
        { href: '/admin/articles', label: t('articles'), icon: FileText },
      ]
    },
    {
      groupTitle: t('groupOperations'),
      items: [
        { 
          href: '/admin/orders', 
          label: t('orders'), 
          icon: ShoppingCart,
          badge: badgeCounts?.orders && badgeCounts.orders > 0 
            ? (badgeCounts.orders > 99 ? '99+' : badgeCounts.orders) 
            : undefined,
          badgeColor: 'bg-rose-500 text-white'
        },
        { 
          href: '/admin/inquiries', 
          label: t('inquiries'), 
          icon: MessageSquare,
          badge: badgeCounts?.inquiries && badgeCounts.inquiries > 0 
            ? (badgeCounts.inquiries > 99 ? '99+' : badgeCounts.inquiries) 
            : undefined,
          badgeColor: 'bg-blue-500 text-white'
        },
        { href: '/admin/reports', label: t('reports'), icon: BarChart3 },
        { href: '/admin/vouchers', label: t('vouchers'), icon: Ticket },
        { href: '/admin/customers', label: t('customers'), icon: Users },
      ]
    },
    {
      groupTitle: t('groupSystem'),
      items: [
        { href: '/admin/logs', label: t('logs'), icon: ClipboardList },
        ...(adminRole === 'SUPERADMIN' ? [
          { href: '/admin/register-admin', label: t('staff'), icon: ShieldCheck }
        ] : []),
        { href: '/admin/settings', label: t('settings'), icon: Settings },
      ]
    }
  ];

  const isLinkActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20 select-none">
      {/* Brand Header */}
      <div className="px-5 border-b border-gray-100 flex items-center justify-between h-16 shrink-0 bg-white">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-emerald-50 border border-emerald-200/80 text-emerald-700 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
            <Store size={18} />
          </div>
          <div>
            <span className="font-bold text-gray-900 tracking-tight text-sm block leading-tight">
              Al-Kautsar
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
              {t('portalTitle')}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links with Micro-animations and Counter Badges */}
      <nav className="flex-1 px-3 py-3.5 space-y-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {group.groupTitle && (
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {group.groupTitle}
                </span>
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isLinkActive(item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ease-in-out cursor-pointer ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/90 shadow-2xs translate-x-0.5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1 rounded-lg transition-transform duration-200 ${
                        active 
                          ? 'text-emerald-700 scale-105' 
                          : 'text-gray-400 group-hover:text-gray-700 group-hover:scale-105'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Right Action: Badges & Active Indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Counter Badge */}
                      {item.badge !== undefined && (
                        <span 
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tracking-tight shadow-2xs animate-in fade-in zoom-in duration-200 ${
                            item.badgeColor || 'bg-emerald-600 text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active Accent Bar Indicator */}
                      {active && (
                        <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full animate-in fade-in zoom-in duration-200" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/40 shrink-0">
        <form action={logoutAdmin}>
          <button 
            type="submit"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50/80 transition-all duration-200 cursor-pointer group hover:translate-x-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 text-red-500 rounded-lg group-hover:scale-105 transition-transform">
                <LogOut size={16} />
              </div>
              <span>{t('logout')}</span>
            </div>
            <ChevronRight size={13} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>
      </div>
    </aside>
  );
}
