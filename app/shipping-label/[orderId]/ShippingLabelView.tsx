'use client';

import { useEffect } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Truck, 
  Package, 
  AlertTriangle,
  QrCode,
  CheckSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { InvoiceData } from '@/app/actions/invoice';

interface ShippingLabelViewProps {
  invoice: InvoiceData;
}

/**
 * Dedicated Thermal Shipping Label (A6 / 100x150mm) view designed for warehouse packing & courier hand-off.
 * Uses high-contrast monochrome & clean borders for crisp output on thermal and standard inkjet/laser printers.
 */
export default function ShippingLabelView({ invoice }: ShippingLabelViewProps) {
  const router = useRouter();

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.opener) {
        window.close();
      } else if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/admin/orders');
      }
    }
  };

  const formattedDate = invoice.orderDate
    ? format(new Date(invoice.orderDate), 'dd MMM yyyy, HH:mm', { locale: idLocale }) + ' WIB'
    : '-';

  return (
    <div className="min-h-screen bg-neutral-100 py-6 px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0">
      {/* 1. On-Screen Control Bar (Hidden on print) */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between gap-3 print:hidden">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Printer size={15} />
            <span>Cetak Label Thermal</span>
          </button>
        </div>
      </div>

      {/* 2. Standard Shipping Label Canvas (100mm x 150mm format) */}
      <div className="w-full max-w-[420px] bg-white border-2 border-dashed border-gray-300 print:border-2 print:border-solid print:border-black rounded-xl p-5 text-gray-900 shadow-sm print:shadow-none print:rounded-none font-sans">
        {/* Header: Brand & Order Identifier */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div>
            <span className="font-extrabold text-base tracking-tight uppercase block leading-none">
              {invoice.company.name || 'Al-Kautsar Herbal'}
            </span>
            <span className="text-[10px] text-gray-600 font-medium block mt-0.5">
              Toko Resmi Herbal & Madu Alami
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">No. Pesanan</span>
            <span className="font-mono font-bold text-xs tracking-tight block">
              {invoice.orderId}
            </span>
          </div>
        </div>

        {/* Courier & Waybill (AWB) Barcode Section */}
        <div className="my-3 p-2.5 border-2 border-black rounded-lg bg-neutral-50/50 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Ekspedisi / Kurir
            </span>
            <div className="flex items-center gap-1.5 font-black text-sm uppercase tracking-wide">
              <Truck size={16} className="shrink-0" />
              <span className="truncate">{invoice.courier || 'Kurir Reguler / Standar'}</span>
            </div>
            {invoice.resi ? (
              <div className="pt-1">
                <span className="text-[9px] text-gray-500 block uppercase font-semibold">No. Resi (AWB)</span>
                <span className="font-mono font-extrabold text-sm tracking-wider text-black block">
                  {invoice.resi}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-gray-500 italic block">Menunggu input resi pengiriman</span>
            )}
          </div>

          <div className="w-16 h-16 border border-gray-300 rounded bg-white flex flex-col items-center justify-center text-center p-1 shrink-0">
            <QrCode size={36} className="text-gray-900" />
            <span className="text-[8px] font-mono font-semibold uppercase mt-0.5">VERIFIED</span>
          </div>
        </div>

        {/* Recipient & Sender Address Grid */}
        <div className="border-t-2 border-b-2 border-black py-3 space-y-3 text-xs">
          {/* Penerima (Recipient) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded text-[9px]">
                PENERIMA (TO)
              </span>
              <span className="font-mono text-[10px] text-gray-500 font-semibold">
                {invoice.customer.phone || '-'}
              </span>
            </div>

            <p className="font-extrabold text-sm text-black pt-0.5">
              {invoice.customer.name}
            </p>

            <p className="text-[11px] leading-relaxed text-gray-800 font-medium">
              {[
                invoice.customer.address,
                invoice.customer.city,
                invoice.customer.province,
                invoice.customer.postalCode ? `Kode Pos: ${invoice.customer.postalCode}` : ''
              ].filter(Boolean).join(', ')}
            </p>

            {invoice.customer.note && (
              <div className="mt-1 p-1.5 bg-amber-50 border border-amber-300 rounded text-[10px] text-amber-950 font-medium flex items-start gap-1">
                <span className="font-bold shrink-0">Catatan:</span>
                <span>{invoice.customer.note}</span>
              </div>
            )}
          </div>

          {/* Pengirim (Sender) */}
          <div className="pt-2 border-t border-dashed border-gray-300 space-y-0.5 text-[11px] text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[9px] uppercase tracking-wider text-gray-500">
                PENGIRIM (FROM):
              </span>
              <span className="font-mono text-[10px] text-gray-600">
                {invoice.company.phone || '0812-3456-7890'}
              </span>
            </div>
            <p className="font-bold text-black text-xs">
              {invoice.company.name || 'Al-Kautsar Herbal Indonesia'}
            </p>
            <p className="text-[10px] text-gray-600">
              {invoice.company.address || 'Bandung, Jawa Barat, Indonesia'}
            </p>
          </div>
        </div>

        {/* Warehouse Packing Checklist (Daftar SKU Barang) */}
        <div className="py-3 border-b-2 border-black space-y-2 text-xs">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-gray-600">
            <span className="flex items-center gap-1">
              <CheckSquare size={12} />
              <span>Daftar Isi Paket (Packing List)</span>
            </span>
            <span>Qty (Pcs)</span>
          </div>

          <div className="divide-y divide-gray-200 border-t border-gray-200">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div key={item.id || idx} className="py-1.5 flex items-center justify-between text-[11px] font-medium">
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span className="w-3.5 h-3.5 border border-black rounded-xs shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <span className="font-mono font-bold text-black shrink-0 text-xs">
                    {item.count} pcs
                  </span>
                </div>
              ))
            ) : (
              <div className="py-2 text-[10px] text-gray-400 italic text-center">
                Rincian produk tidak tersedia
              </div>
            )}
          </div>
        </div>

        {/* Footer Caution & Date Stamp */}
        <div className="pt-3 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 font-bold text-red-700 uppercase tracking-tight text-[9px] border border-red-200 bg-red-50/80 px-2 py-1 rounded">
            <AlertTriangle size={11} className="shrink-0" />
            <span>FRAGILE - JANGAN DIBANTING</span>
          </div>
          <span className="text-[9px] font-mono text-gray-500">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* 3. Thermal Print Media Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
