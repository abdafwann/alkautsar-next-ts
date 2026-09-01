import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getInvoiceData } from '@/app/actions/invoice';
import ShippingLabelView from './ShippingLabelView';

export const dynamic = 'force-dynamic';

interface ShippingLabelPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: ShippingLabelPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Label Pengiriman #${orderId} | Al-Kautsar Herbal`,
    description: `Label resi pengiriman thermal untuk pesanan #${orderId}`,
  };
}

export default async function ShippingLabelPage({ params }: ShippingLabelPageProps) {
  const { orderId } = await params;
  const res = await getInvoiceData(orderId);

  if (!res.success || !res.data) {
    notFound();
  }

  return <ShippingLabelView invoice={res.data} />;
}
