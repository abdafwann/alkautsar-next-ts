import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getArticleById } from '@/app/actions/articles';
import ArticleFormClient from './ArticleFormClient';
import AdminPageErrorBoundary from '../../_components/AdminPageErrorBoundary';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : null;
  return {
    title: id ? 'Edit Artikel Blog | Admin Al-Kautsar' : 'Tulis Artikel Baru | Admin Al-Kautsar',
    description: 'Editor artikel blog edukasi kesehatan herbal dan thibbun nabawi',
  };
}

export default async function ArticleFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : null;
  
  let article = null;
  if (id) {
    const res = await getArticleById(id);
    if ('success' in res && res.success && 'data' in res && res.data) {
      article = res.data;
    }
  }

  return (
    <AdminPageErrorBoundary>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
            title="Kembali ke Daftar Artikel"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {id ? 'Edit Artikel Edukasi' : 'Tulis Artikel Edukasi Baru'}
              </h1>
              {id && (
                <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md font-bold">
                  Mode Edit
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Tulis wawasan thibbun nabawi, khasiat herbal, panduan kesehatan, serta atur gambar sampul.
            </p>
          </div>
        </div>

        {/* 2-Column Form */}
        <ArticleFormClient initialData={article} />
      </div>
    </AdminPageErrorBoundary>
  );
}
