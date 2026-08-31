'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  UserPlus, 
  LogOut, 
  Check, 
  ShoppingBag, 
  Truck, 
  Mail, 
  Wallet, 
  Clock, 
  Globe 
} from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

interface AdminHeaderProps {
  adminName: string;
  adminEmail: string;
}

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'order_placed',
    title: { ID: 'Pesanan Baru', EN: 'New Order' },
    message: { ID: 'Pesanan #INV-2026 telah dibuat.', EN: 'Order #INV-2026 has been placed.' },
    customerName: 'Budi Santoso',
    isRead: false,
    createdAt: { ID: 'Baru saja', EN: 'Just now' }
  },
  {
    id: 2,
    type: 'payment_received',
    title: { ID: 'Pembayaran Diterima', EN: 'Payment Confirmed' },
    message: { ID: 'Pembayaran untuk #INV-2025 telah diverifikasi.', EN: 'Payment for #INV-2025 has been verified.' },
    customerName: 'Siti Aminah',
    isRead: false,
    createdAt: { ID: '2 jam yang lalu', EN: '2 hours ago' }
  },
  {
    id: 3,
    type: 'order_updated',
    title: { ID: 'Pesanan Dikirim', EN: 'Order Shipped' },
    message: { ID: 'Pesanan #INV-2024 sedang dalam pengiriman.', EN: 'Order #INV-2024 is on delivery.' },
    customerName: 'Agus Pratama',
    isRead: true,
    createdAt: { ID: '1 hari yang lalu', EN: '1 day ago' }
  },
  {
    id: 4,
    type: 'new_inquiry',
    title: { ID: 'Pesan Masuk', EN: 'New Inquiry' },
    message: { ID: 'Ada pertanyaan baru mengenai produk Herbal Plus.', EN: 'New question received regarding Herbal Plus.' },
    customerName: '',
    isRead: true,
    createdAt: { ID: '2 hari yang lalu', EN: '2 days ago' }
  }
];

export default function AdminHeader({ adminName, adminEmail }: AdminHeaderProps) {
  const { locale, setLocale, t } = useAdminLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (langRef.current && !langRef.current.contains(target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const initial = adminName ? adminName.charAt(0).toUpperCase() : 'A';

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
        return <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><ShoppingBag size={18} /></div>;
      case 'order_updated':
        return <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0"><Truck size={18} /></div>;
      case 'payment_received':
        return <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Wallet size={18} /></div>;
      case 'new_inquiry':
        return <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Mail size={18} /></div>;
      default:
        return <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0"><Bell size={18} /></div>;
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10 flex items-center justify-end px-8 gap-4 shadow-2xs">
      
      {/* 1. Language Switcher (Segmented Pill Toggle) */}
      <div className="relative" ref={langRef}>
        <div className="bg-gray-100/80 p-0.5 rounded-xl flex items-center border border-gray-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setLocale('ID')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              locale === 'ID'
                ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-black/5 font-extrabold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Bahasa Indonesia"
          >
            <span>🇮🇩</span>
            <span>ID</span>
          </button>

          <button
            type="button"
            onClick={() => setLocale('EN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              locale === 'EN'
                ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-black/5 font-extrabold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="English"
          >
            <span>🇬🇧</span>
            <span>EN</span>
          </button>
        </div>
      </div>

      <div className="h-4 w-px bg-gray-200 mx-0.5" />

      {/* 2. Notifications Dropdown */}
      <div className="relative" ref={notifRef}>
        <button 
          type="button"
          onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setIsLangOpen(false); }}
          className="p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors relative cursor-pointer"
          title={t('notifications')}
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in-50 duration-200">
              {unreadCount}
            </span>
          )}
        </button>

        {isNotifOpen && (
          <div className="absolute right-0 top-full mt-2.5 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{t('notifications')}</h3>
                <p className="text-[11px] text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} ${t('newNotifications')}` : t('allRead')}
                </p>
              </div>
              {unreadCount > 0 && (
                <button 
                  type="button"
                  onClick={markAllAsRead}
                  className="text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title={t('markAllRead')}
                >
                  <Check size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`flex gap-3.5 p-3.5 cursor-pointer transition-colors ${
                      notif.isRead ? 'hover:bg-gray-50 bg-white' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                    }`}
                    onClick={() => setIsNotifOpen(false)}
                  >
                    {getNotifIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-xs truncate ${notif.isRead ? 'font-medium text-gray-900' : 'font-bold text-gray-900'}`}>
                          {notif.title[locale]}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 ${notif.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                        {notif.message[locale]}
                      </p>
                      {notif.customerName && (
                        <p className="text-[11px] text-gray-400 mt-1 truncate">
                          {locale === 'ID' ? 'Pelanggan:' : 'Customer:'} {notif.customerName}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                        <Clock size={11} />
                        <span className="text-[10px] font-medium">{notif.createdAt[locale]}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <Bell size={36} className="text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500">{t('allRead')}</p>
                </div>
              )}
            </div>

            <div className="p-2 border-t border-gray-100 bg-gray-50/50">
              <button 
                type="button"
                onClick={() => { setIsNotifOpen(false); router.push('/admin/orders'); }}
                className="w-full text-center text-xs font-bold text-gray-700 hover:text-emerald-700 py-2 rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                {locale === 'ID' ? 'Lihat Semua Pesanan' : 'View All Orders'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. User Avatar & Profile Dropdown */}
      <div className="relative" ref={profileRef}>
        <button 
          type="button"
          onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsLangOpen(false); }}
          className="h-8.5 w-8.5 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-emerald-500/30 transition-all"
        >
          {initial}
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header Popover */}
            <div className="px-4 py-3 bg-gray-50/50">
              <p className="font-bold text-xs text-gray-900 truncate">{adminName}</p>
              <p className="text-[11px] text-gray-500 truncate">{adminEmail}</p>
            </div>

            <div className="h-px w-full bg-gray-100" />

            {/* Menu Options */}
            <div className="p-1.5 flex flex-col gap-0.5 text-xs">
              <button 
                type="button"
                onClick={() => { setIsProfileOpen(false); router.push('/admin/settings'); }}
                className="flex items-center gap-2.5 px-3 py-2 font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
              >
                <Settings size={14} className="text-gray-400" />
                <span>{t('settings')}</span>
              </button>

              <button 
                type="button"
                onClick={() => { setIsProfileOpen(false); router.push('/admin/register-admin'); }}
                className="flex items-center gap-2.5 px-3 py-2 font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-emerald-700 transition-colors w-full text-left cursor-pointer"
              >
                <UserPlus size={14} className="text-gray-400" />
                <span>{t('staff')}</span>
              </button>
            </div>

            <div className="h-px w-full bg-gray-100" />

            {/* Logout */}
            <div className="p-1.5">
              <button 
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
              >
                <LogOut size={14} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
    </header>
  );
}
