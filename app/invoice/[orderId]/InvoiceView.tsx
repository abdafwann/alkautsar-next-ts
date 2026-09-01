'use client';

import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Share2,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/format';
import type { InvoiceData } from '@/app/actions/invoice';

interface InvoiceViewProps {
  invoice: InvoiceData;
}

export default function InvoiceView({ invoice }: InvoiceViewProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
        router.back();
      } else if (window.opener) {
        window.close();
      } else {
        router.push(`/track-order?orderId=${encodeURIComponent(invoice.orderId)}`);
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const isPaid = invoice.paymentStatus === 'PAID';
  const isCancelled = invoice.orderStatus === 'CANCELLED';

  const formattedOrderDate = invoice.orderDate
    ? format(new Date(invoice.orderDate), 'dd MMMM yyyy, HH:mm', { locale: idLocale }) + ' WIB'
    : '-';

  const formattedPaymentDate = invoice.paymentDate
    ? format(new Date(invoice.paymentDate), 'dd MMMM yyyy, HH:mm', { locale: idLocale }) + ' WIB'
    : '-';

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 lg:px-8 text-neutral-900 print:bg-white print:py-0 print:px-0">
      {/* 1. Action Header Toolbar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs cursor-pointer transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Printer size={16} />
            <span>Cetak Faktur (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Official Invoice Paper Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-neutral-200/80 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 print:max-w-full">
        {/* Kop Surat & Company Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-8 border-b-2 border-neutral-800 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                AK
              </div>
              <h1 className="text-xl font-black tracking-tight text-neutral-900">
                {invoice.company.name}
              </h1>
            </div>
            <p className="text-xs text-neutral-500 font-medium max-w-sm">
              {invoice.company.tagline}
            </p>
            <div className="text-xs text-neutral-600 space-y-0.5 pt-1">
              <p>{invoice.company.address}, {invoice.company.city}</p>
              <p className="flex items-center gap-3 text-neutral-500">
                <span>Telp: {invoice.company.phone}</span>
                <span>•</span>
                <span>Email: {invoice.company.email}</span>
              </p>
            </div>
          </div>

          {/* Invoice Meta Block */}
          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              FAKTUR PENJUALAN RESMI
            </span>
            <div className="text-xl font-black font-mono text-neutral-900 pt-1">
              {invoice.invoiceNumber}
            </div>
            <p className="text-xs text-neutral-500 font-mono">
              ID Pesanan: <strong className="text-neutral-800">{invoice.orderId}</strong>
            </p>
            <div className="pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : isCancelled
                  ? 'bg-red-100 text-red-900 border border-red-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {isPaid ? <CheckCircle2 size={14} /> : isCancelled ? <XCircle size={14} /> : <Clock size={14} />}
                {isPaid ? 'LUNAS (PAID)' : isCancelled ? 'DIBATALKAN' : 'MENUNGGU PEMBAYARAN'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Transaction Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-neutral-200 text-xs">
          {/* Bill & Ship To */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Diterbitkan Untuk (Pembeli):
            </span>
            <h3 className="text-sm font-bold text-neutral-900">{invoice.customer.name}</h3>
            <p className="text-neutral-600 font-mono">{invoice.customer.phone} • {invoice.customer.email}</p>
            <div className="text-neutral-700 leading-relaxed pt-1 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/60">
              <strong className="text-neutral-900 block font-semibold mb-0.5">Alamat Pengiriman:</strong>
              <p>{invoice.customer.address}</p>
              <p>{invoice.customer.city}, {invoice.customer.province} {invoice.customer.postalCode}</p>
              {invoice.customer.note && (
                <p className="text-neutral-500 italic mt-1 border-t border-neutral-200 pt-1">
                  Catatan: "{invoice.customer.note}"
                </p>
              )}
            </div>
          </div>

          {/* Payment & Logistics Info */}
          <div className="space-y-2 sm:text-right">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Tanggal & Waktu Pemesanan:
              </span>
              <p className="font-semibold text-neutral-800">{formattedOrderDate}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Metode Pembayaran:
              </span>
              <p className="font-semibold text-neutral-800">{invoice.paymentType}</p>
              {isPaid && (
                <p className="text-[11px] text-emerald-700">Waktu Bayar: {formattedPaymentDate}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Ekspedisi & Nomor Resi:
              </span>
              <p className="font-semibold text-neutral-800">{invoice.courier || 'Kurir Standar'}</p>
              {invoice.resi ? (
                <p className="font-mono text-emerald-700 font-bold">No. Resi: {invoice.resi}</p>
              ) : (
                <p className="text-neutral-400 italic">Resi belum diterbitkan</p>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-800 text-[11px] font-bold uppercase text-neutral-600">
                <th className="py-2.5 px-2 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Deskripsi Produk Herbal</th>
                <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 text-center w-16">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-neutral-50/50">
                  <td className="py-3 px-2 text-center text-neutral-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-neutral-900">{item.title}</p>
                    {item.form && (
                      <span className="text-[10px] text-neutral-500 font-medium">
                        Bentuk: {item.form}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-neutral-700">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-neutral-900">
                    {item.count}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Calculation */}
        <div className="pt-4 border-t-2 border-neutral-800 flex flex-col sm:flex-row justify-between gap-6 text-xs">
          {/* Note / Terms */}
          <div className="max-w-sm space-y-2 text-neutral-500 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-neutral-800 text-xs">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>Jaminan Kualitas & Bukti Pembayaran Sah</span>
            </div>
            <p>
              Faktur ini merupakan dokumen elektronik yang sah yang diterbitkan oleh sistem komputer PT. Al-Kautsar Herbal Indonesia dan tidak memerlukan tanda tangan basah.
            </p>
            <p>
              Simpan faktur ini sebagai bukti garansi keaslian produk dan syarat layanan retur/klaim.
            </p>
          </div>

          {/* Numbers Calculation Table */}
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal Produk:</span>
              <span className="font-mono font-semibold text-neutral-900">
                {formatCurrency(invoice.pricing.subtotal)}
              </span>
            </div>

            {invoice.pricing.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>
                  Diskon Voucher {invoice.pricing.voucherCode ? `(${invoice.pricing.voucherCode})` : ''}:
                </span>
                <span className="font-mono font-semibold">
                  -{formatCurrency(invoice.pricing.discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>Biaya Pengiriman:</span>
              <span className="font-mono font-semibold text-neutral-900">
                {invoice.pricing.shippingFee > 0 ? formatCurrency(invoice.pricing.shippingFee) : 'Gratis Ongkir'}
              </span>
            </div>

            <div className="pt-2 border-t-2 border-neutral-900 flex justify-between items-center text-neutral-900 font-bold text-sm">
              <span>TOTAL BAYAR:</span>
              <span className="font-mono text-base text-emerald-800 font-black">
                {formatCurrency(invoice.pricing.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Signature & Timestamp */}
        <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2">
          <span>Dicetak otomatis pada: {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: idLocale })} WIB</span>
          <span className="font-mono text-neutral-500">PT. Al-Kautsar Herbal Indonesia • Dokumen Sah</span>
        </div>
      </div>
    </div>
  );
}
