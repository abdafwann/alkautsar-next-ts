import { Metadata } from 'next';
import { getArticles } from '@/app/actions/articles';
import ArticleListClient from './ArticleListClient';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kelola Artikel & Edukasi Herbal | Admin Al-Kautsar',
  description: 'Kelola artikel blog, edukasi kesehatan, dan konten thibbun nabawi',
};

export default async function ArticlesPage() {
  const articlesResponse = await getArticles(true);
  const articles = articlesResponse.success && articlesResponse.data ? (articlesResponse.data as any[]) : [];

  return (
    <AdminPageErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Artikel & Edukasi Herbal</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tulis, sunting, dan publikasikan artikel edukasi kesehatan herbal serta panduan thibbun nabawi.
            </p>
          </div>
        </div>

        {/* Article Manager Client Component */}
        <ArticleListClient 
          initialArticles={articles} 
          error={!articlesResponse.success ? articlesResponse.error : undefined}
        />
      </div>
    </AdminPageErrorBoundary>
  );
}
