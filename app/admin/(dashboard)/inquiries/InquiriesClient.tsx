'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Search, 
  Mail, 
  MailOpen, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  Phone, 
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { updateInquiryStatus, getInquiries } from '@/app/actions/inquiries';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  repliedAt?: Date | string | null;
  repliedBy?: string | null;
  createdAt: Date | string;
}

const DUMMY_INQUIRIES: InquiryItem[] = [
  {
    id: 'inq-preview-001',
    name: 'dr. Hendra Kusuma',
    email: 'dr.hendra@kliniksehat.id',
    phone: '081298765432',
    subject: 'Konsultasi Dosis Habba Oil untuk Pasien Maag Kronis',
    message: 'Selamat pagi admin Al-Kautsar, saya ingin menanyakan apakah produk Minyak Habbatusauda kapsul aman dikonsumsi oleh pasien dengan riwayat maag kronis atau GERD? Apakah disarankan diminum sesudah makan?',
    isRead: false,
    createdAt: '2026-08-30T09:15:00.000Z',
  },
  {
    id: 'inq-preview-002',
    name: 'Ibu Ratna Wulandari',
    email: 'ratna.wulan@gmail.com',
    phone: '085612348899',
    subject: 'Pemesanan Grosir untuk Apotek di Yogyakarta',
    message: 'Halo Al-Kautsar, kami dari Apotek Sehat Farma Yogyakarta berminat untuk menjadi agen/reseller produk madu herbal dan habbatusauda. Apakah ada minimal order dan pricelist khusus grosir?',
    isRead: false,
    createdAt: '2026-08-30T06:30:00.000Z',
  },
  {
    id: 'inq-preview-003',
    name: 'Faisal Akbar',
    email: 'faisal.akbar@yahoo.co.id',
    phone: '081377889900',
    subject: 'Sertifikasi Halal & BPOM Produk Zaitun',
    message: 'Mohon info nomor registrasi BPOM dan sertifikat Halal MUI untuk produk Minyak Zaitun Extra Virgin kemasan 250ml. Terima kasih.',
    isRead: true,
    createdAt: '2026-08-29T14:20:00.000Z',
  },
  {
    id: 'inq-preview-004',
    name: 'Nur Aisyah',
    email: 'aisyah.nur@outlook.com',
    phone: '087811223344',
    subject: 'Pertanyaan Estimasi Ongkir ke Papua',
    message: 'Apakah pengiriman ke Sorong Papua bisa menggunakan ekspedisi kargo untuk pesanan di atas 5 kg? Berapa estimasi hari perjalanannya?',
    isRead: true,
    createdAt: '2026-08-27T11:00:00.000Z',
  },
];

const STATUS_TABS = [
  { id: 'ALL', label: { ID: 'Semua Pesan', EN: 'All Messages' } },
  { id: 'UNREAD', label: { ID: 'Belum Dibaca (Baru)', EN: 'Unread (New)' } },
  { id: 'READ', label: { ID: 'Sudah Dibaca', EN: 'Read' } },
  { id: 'TODAY', label: { ID: 'Hari Ini', EN: 'Today' } },
] as const;

export default function InquiriesClient({ 
  initialData, 
  error 
}: { 
  initialData: InquiryItem[]; 
  error?: string; 
}) {
  const { locale, t } = useAdminLanguage();
  const router = useRouter();

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isUsingDummy, setIsUsingDummy] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'name_asc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const itemsPerPage = 10;

  const loadData = useCallback(() => {
    if (initialData && initialData.length > 0) {
      setInquiries(initialData);
      setIsUsingDummy(false);
    } else {
      setInquiries(DUMMY_INQUIRIES);
      setIsUsingDummy(true);
    }
  }, [initialData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshDatabase = async () => {
    const res = await getInquiries();
    if (res.success && res.data && res.data.length > 0) {
      setInquiries(res.data as any[]);
      setIsUsingDummy(false);
      toast.success(locale === 'EN' ? 'Inquiries loaded from database' : 'Data pesan berhasil dimuat dari database');
    } else {
      setInquiries(DUMMY_INQUIRIES);
      setIsUsingDummy(true);
      toast(locale === 'EN' ? 'No messages in database, displaying preview data' : 'Database belum memiliki pesan, menampilkan contoh preview', { icon: 'ℹ️' });
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = inquiries.length;
    const unread = inquiries.filter(i => !i.isRead).length;
    const read = inquiries.filter(i => i.isRead).length;
    const todayCount = inquiries.filter(i => isToday(new Date(i.createdAt))).length;
    return { total, unread, read, todayCount };
  }, [inquiries]);

  // Filter & Search
  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter(inq => {
        if (selectedStatus === 'UNREAD' && inq.isRead) return false;
        if (selectedStatus === 'READ' && !inq.isRead) return false;
        if (selectedStatus === 'TODAY' && !isToday(new Date(inq.createdAt))) return false;

        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          inq.name.toLowerCase().includes(term) ||
          inq.email.toLowerCase().includes(term) ||
          (inq.phone && inq.phone.toLowerCase().includes(term)) ||
          (inq.subject && inq.subject.toLowerCase().includes(term)) ||
          inq.message.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (sortOption === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOption === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [inquiries, selectedStatus, searchTerm, sortOption]);

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage) || 1;
  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInquiries.slice(start, start + itemsPerPage);
  }, [filteredInquiries, currentPage, itemsPerPage]);

  const handleMarkAsRead = async (id: string, isRead: boolean, silent = false) => {
    if (isUsingDummy) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead } : inq));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, isRead } : null);
      }
      if (!silent) {
        toast.success(isRead ? (locale === 'EN' ? 'Marked as read (Preview)' : 'Pesan ditandai sudah dibaca (Preview)') : (locale === 'EN' ? 'Marked as unread (Preview)' : 'Pesan ditandai belum dibaca (Preview)'));
      }
      return;
    }

    setIsUpdating(id);
    const res: any = await updateInquiryStatus(id, isRead);
    if (res.success) {
      if (!silent) {
        toast.success(isRead ? (locale === 'EN' ? 'Message marked as read' : 'Pesan ditandai sudah dibaca') : (locale === 'EN' ? 'Message marked as unread' : 'Pesan ditandai belum dibaca'));
      }
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead } : inq));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, isRead } : null);
      }
      router.refresh();
    } else {
      if (!silent) {
        toast.error(res.error || (locale === 'EN' ? 'Failed to update status' : 'Gagal memperbarui status'));
      }
    }
    setIsUpdating(null);
  };

  const handleOpenInquiry = (inq: InquiryItem) => {
    setSelectedInquiry(inq);
    if (!inq.isRead) {
      handleMarkAsRead(inq.id, true, true);
    }
  };

  const handleReplyEmail = (inquiry: InquiryItem) => {
    const subject = encodeURIComponent('Re: ' + (inquiry.subject || (locale === 'EN' ? 'Customer Inquiry - PT. Al-Kautsar' : 'Pertanyaan Pelanggan PT. Al-Kautsar')));
    const body = encodeURIComponent(
      locale === 'EN'
        ? `Hello ${inquiry.name},\n\nThank you for contacting PT. Al-Kautsar Herbal.\n\nIn response to your message:\n"${inquiry.message}"\n\n---\nWarm Regards,\nCustomer Support PT. Al-Kautsar`
        : `Halo ${inquiry.name},\n\nTerima kasih telah menghubungi PT. Al-Kautsar.\n\nMenanggapi pesan Anda:\n"${inquiry.message}"\n\n---\nSalam Hangat,\nCustomer Support PT. Al-Kautsar`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${inquiry.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');

    if (!inquiry.isRead) {
      handleMarkAsRead(inquiry.id, true, true);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
        <h3 className="font-semibold text-sm">{locale === 'EN' ? 'Failed to load messages' : 'Gagal memuat pesan'}</h3>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {locale === 'EN' ? 'Customer Inquiries & Messages' : 'Pesan & Pertanyaan Masuk'}
        </h1>
        <p className="text-sm text-gray-500 mt-1.5">
          {locale === 'EN' 
            ? 'Manage customer inquiries, product questions, herbal consultations, and support responses.'
            : 'Kelola pesan masuk, pertanyaan produk, konsultasi, dan tanggapan customer service.'}
        </p>
      </div>

      {/* 1. Preview Mode Notice if DB is empty */}
      {isUsingDummy && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>
              <strong>{locale === 'EN' ? 'Demo Mode:' : 'Mode Preview Dummy Data:'}</strong> {locale === 'EN' ? 'No inquiries in database. Displaying sample customer questions for layout testing.' : 'Belum ada pesan masuk di database. Menampilkan contoh pesan konsultasi pelanggan agar tampilan dapat dipratinjau.'}
            </span>
          </div>
          <button 
            onClick={refreshDatabase}
            className="flex items-center gap-1 font-semibold text-amber-900 hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw size={12} /> {locale === 'EN' ? 'Check Database' : 'Cek Ulang Database'}
          </button>
        </div>
      )}

      {/* 2. Executive Stat Cards (Crisp & Clean) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('totalMessages')}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{t('unreadMessages')}</div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{metrics.unread}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{locale === 'EN' ? 'Replied / Read' : 'Sudah Ditanggapi'}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.read}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">{locale === 'EN' ? "Today's Messages" : 'Pesan Hari Ini'}</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{metrics.todayCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200/70 shadow-xs overflow-hidden">
        {/* Filter Tabs & Search Header */}
        <div className="p-3.5 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => {
              const active = selectedStatus === tab.id;
              const tabLabel = tab.label[locale];

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedStatus(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tabLabel}
                  {tab.id === 'UNREAD' && metrics.unread > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[10px] bg-amber-500 text-white font-bold">
                      {metrics.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-gray-100">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={locale === 'EN' ? 'Search name, email, subject, or message...' : 'Cari nama, email, subjek, atau pesan...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-8 bg-gray-50/50 border-gray-200 h-9 text-xs rounded-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-green cursor-pointer font-medium"
                >
                  <option value="newest">{locale === 'EN' ? 'Newest' : 'Terbaru'}</option>
                  <option value="oldest">{locale === 'EN' ? 'Oldest' : 'Terlama'}</option>
                  <option value="name_asc">{locale === 'EN' ? 'Sender Name (A-Z)' : 'Nama Pengirim (A-Z)'}</option>
                </select>
              </div>

              <span className="text-xs text-gray-400">
                Total: <strong className="text-gray-700 font-semibold">{filteredInquiries.length}</strong> {locale === 'EN' ? 'messages' : 'pesan'}
              </span>
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="w-[18%] py-3 px-4">{locale === 'EN' ? 'TIME' : 'WAKTU'}</th>
                <th className="w-[24%] py-3 px-4">{locale === 'EN' ? 'SENDER' : 'PENGIRIM'}</th>
                <th className="w-[36%] py-3 px-4">{locale === 'EN' ? 'SUBJECT & MESSAGE' : 'SUBJEK & PESAN'}</th>
                <th className="w-[12%] py-3 px-4">{locale === 'EN' ? 'STATUS' : 'STATUS'}</th>
                <th className="w-[10%] py-3 px-4 text-right">{locale === 'EN' ? 'OPTIONS' : 'OPSI'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    {locale === 'EN' ? 'No messages found.' : 'Tidak ada pesan yang ditemukan.'}
                  </td>
                </tr>
              ) : (
                paginatedInquiries.map((inq) => (
                  <tr 
                    key={inq.id}
                    className={`hover:bg-gray-50/80 transition-colors ${!inq.isRead ? 'bg-amber-50/25' : ''}`}
                  >
                    {/* Time */}
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        <span>
                          {format(new Date(inq.createdAt), 'dd MMM yyyy, HH:mm', { locale: locale === 'EN' ? undefined : localeId })}
                        </span>
                      </div>
                    </td>

                    {/* Sender */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{inq.name}</div>
                      <div className="text-gray-500 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>{inq.email}</span>
                        {inq.phone && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><Phone size={10} /> {inq.phone}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Subject & Snippet */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-medium text-gray-800 truncate">
                        {inq.subject || (locale === 'EN' ? '(No Subject)' : '(Tanpa Subjek)')}
                      </div>
                      <div className="text-gray-500 text-[11px] truncate mt-0.5">
                        {inq.message}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {!inq.isRead ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Mail size={11} /> {locale === 'EN' ? 'New' : 'Baru'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <MailOpen size={11} /> {locale === 'EN' ? 'Read' : 'Dibaca'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenInquiry(inq)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title={locale === 'EN' ? 'Read Full Message' : 'Baca Pesan Lengkap'}
                        >
                          <Eye size={13} />
                          <span>{locale === 'EN' ? 'Read' : 'Baca'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleReplyEmail(inq)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                          title={locale === 'EN' ? 'Reply via Gmail' : 'Balas via Gmail'}
                        >
                          <ExternalLink size={12} />
                          <span>{locale === 'EN' ? 'Reply' : 'Balas'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredInquiries.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {locale === 'EN'
                ? `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredInquiries.length)} of ${filteredInquiries.length} messages`
                : `Menampilkan ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredInquiries.length)} dari ${filteredInquiries.length} pesan`}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title={locale === 'EN' ? 'Customer Inquiry Details' : 'Rincian Pesan & Pertanyaan'}
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-gray-400 font-medium">{locale === 'EN' ? 'Sender' : 'Pengirim'}</div>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">{selectedInquiry.name}</div>
                  <div className="text-gray-500 mt-0.5">{selectedInquiry.email}</div>
                  {selectedInquiry.phone && (
                    <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> {selectedInquiry.phone}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block">
                    {format(new Date(selectedInquiry.createdAt), 'dd MMMM yyyy, HH:mm', { locale: locale === 'EN' ? undefined : localeId })}
                  </span>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedInquiry.isRead ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedInquiry.isRead ? (locale === 'EN' ? 'Read' : 'Sudah Dibaca') : (locale === 'EN' ? 'New Message' : 'Pesan Baru')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                {locale === 'EN' ? 'Subject' : 'Subjek'}
              </label>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800">
                {selectedInquiry.subject || (locale === 'EN' ? '(No Subject)' : '(Tanpa Subjek)')}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                {locale === 'EN' ? 'Message Content' : 'Isi Pesan Lengkap'}
              </label>
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
              <button
                type="button"
                onClick={() => handleMarkAsRead(selectedInquiry.id, !selectedInquiry.isRead)}
                disabled={isUpdating === selectedInquiry.id}
                className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {selectedInquiry.isRead ? (locale === 'EN' ? 'Mark as Unread' : 'Tandai Belum Dibaca') : (locale === 'EN' ? 'Mark as Read' : 'Tandai Sudah Dibaca')}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="button"
                  onClick={() => handleReplyEmail(selectedInquiry)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>{locale === 'EN' ? 'Reply via Gmail' : 'Balas via Gmail'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
