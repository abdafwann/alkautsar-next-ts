import { Metadata } from 'next';
import { getInquiries } from '@/app/actions/inquiries';
import InquiriesClient from './InquiriesClient';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const metadata: Metadata = {
  title: 'Pesan Pelanggan | Admin Al-Kautsar',
  description: 'Kelola pertanyaan, konsultasi produk, dan pesan masuk pelanggan',
};

export default async function InquiriesPage() {
  const result = await getInquiries();
  const inquiries = result.success && result.data ? (result.data as any[]) : [];

  return (
    <AdminPageErrorBoundary>
      <InquiriesClient 
        initialData={inquiries} 
        error={!result.success ? result.error : undefined} 
      />
    </AdminPageErrorBoundary>
  );
}
