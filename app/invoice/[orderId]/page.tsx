import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getInvoiceData } from '@/app/actions/invoice';
import InvoiceView from './InvoiceView';

export const dynamic = 'force-dynamic';

interface InvoicePageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Faktur Pembelian #${orderId} | Al-Kautsar Herbal`,
    description: `Faktur resmi bukti transaksi pesanan #${orderId} di Al-Kautsar Herbal Indonesia`,
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { orderId } = await params;
  const res = await getInvoiceData(orderId);

  if (!res.success || !res.data) {
    notFound();
  }

  return <InvoiceView invoice={res.data} />;
}
