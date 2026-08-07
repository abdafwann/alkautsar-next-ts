'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Settings, UserPlus, LogOut, Check, ShoppingBag, Truck, Mail, Wallet, Clock } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  adminName: string;
  adminEmail: string;
}

// Dummy notifications for MVP
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'order_placed',
    title: 'Pesanan Baru',
    message: 'Pesanan #INV-2026 telah dibuat.',
    customerName: 'Budi Santoso',
    isRead: false,
    createdAt: 'Baru saja'
  },
  {
    id: 2,
    type: 'payment_received',
    title: 'Pembayaran Diterima',
    message: 'Pembayaran untuk #INV-2025 telah dikonfirmasi.',
    customerName: 'Siti Aminah',
    isRead: false,
    createdAt: '2 jam yang lalu'
  },
  {
    id: 3,
    type: 'order_updated',
    title: 'Pesanan Dikirim',
    message: 'Pesanan #INV-2024 sedang dalam perjalanan.',
    customerName: 'Agus Pratama',
    isRead: true,
    createdAt: '1 hari yang lalu'
  },
  {
    id: 4,
    type: 'new_inquiry',
    title: 'Pesan Masuk',
    message: 'Ada pertanyaan baru mengenai produk Herbal Plus.',
    customerName: '',
    isRead: true,
    createdAt: '2 hari yang lalu'
  }
];

export default function AdminHeader({ adminName, adminEmail }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
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
        return <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><ShoppingBag size={20} /></div>;
      case 'order_updated':
        return <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0"><Truck size={20} /></div>;
      case 'payment_received':
        return <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0"><Wallet size={20} /></div>;
      case 'new_inquiry':
        return <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Mail size={20} /></div>;
      default:
        return <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0"><Bell size={20} /></div>;
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10 flex items-center justify-end px-8 gap-6 shadow-sm">
      
      {/* Language / Region */}
      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm cursor-pointer hover:text-primary-green transition-colors">
        ID
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button 
          onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
          className="text-slate-400 hover:text-primary-green transition-colors relative cursor-pointer mt-1"
        >
          <Bell size={20} className="text-slate-400 fill-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {isNotifOpen && (
          <div className="absolute right-0 top-full mt-4 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Notifikasi</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {unreadCount > 0 ? `Anda memiliki ${unreadCount} notifikasi baru` : 'Semua notifikasi telah dibaca'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-primary-green hover:bg-green-50 p-1.5 rounded-lg transition-colors"
                  title="Tandai semua dibaca"
                >
                  <Check size={18} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="max-h-[340px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`flex gap-4 p-4 border-b border-gray-50 cursor-pointer transition-colors ${notif.isRead ? 'hover:bg-gray-50 bg-white' : 'bg-green-50/30 hover:bg-green-50/60'}`}
                      onClick={() => setIsNotifOpen(false)}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm truncate ${notif.isRead ? 'font-medium text-gray-900' : 'font-bold text-gray-900'}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary-green shrink-0 mt-1.5"></span>
                          )}
                        </div>
                        <p className={`text-sm mt-0.5 ${notif.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                          {notif.message}
                        </p>
                        {notif.customerName && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            Pelanggan: {notif.customerName}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-gray-400">
                          <Clock size={12} />
                          <span className="text-[11px] font-medium">{notif.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <Bell size={48} className="text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500">Tidak ada notifikasi saat ini.</p>
                </div>
              )}
            </div>

            <div className="p-2 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => { setIsNotifOpen(false); router.push('/admin/orders'); }}
                className="w-full text-center text-sm font-bold text-gray-600 hover:text-primary-green py-2.5 rounded-xl hover:bg-white transition-colors"
              >
                Lihat Semua
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar & Profile Dropdown */}
      <div className="relative" ref={profileRef}>
        <button 
          onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
          className="h-9 w-9 bg-gradient-to-br from-primary-green to-[#1b5e3a] text-white rounded-full flex items-center justify-center font-bold text-lg border-[3px] border-white ring-1 ring-gray-200 shadow-sm cursor-pointer hover:ring-primary-green transition-all"
        >
          {initial}
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header Popover */}
            <div className="px-5 py-4 bg-gray-50/50">
              <p className="font-bold text-gray-900 truncate">{adminName}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{adminEmail}</p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            {/* Menu Options */}
            <div className="p-2 flex flex-col gap-1">
              <button 
                onClick={() => { setIsProfileOpen(false); router.push('/admin/settings'); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-primary-green transition-colors w-full text-left"
              >
                <Settings size={16} className="text-gray-400" />
                Pengaturan
              </button>

              <button 
                onClick={() => { setIsProfileOpen(false); router.push('/admin/settings?tab=admins'); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-primary-green transition-colors w-full text-left"
              >
                <UserPlus size={16} className="text-gray-400" />
                Tambah Admin Baru
              </button>
            </div>

            <div className="h-px w-full bg-gray-100"></div>

            {/* Logout */}
            <div className="p-2">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
      
    </header>
  );
}
