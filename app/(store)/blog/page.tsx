import { getArticles } from '@/app/actions/articles';
import BlogClient, { ArticleItemData } from './BlogClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jurnal Kesehatan & Edukasi Herbal | PT. AL-KAUTSAR',
  description: 'Artikel sains fitofarmaka, edukasi kesehatan alami, dan tips herbal terstandar dari para ahli PT. Al-Kautsar.',
  openGraph: {
    title: 'Jurnal Kesehatan & Edukasi Herbal | PT. AL-KAUTSAR',
    description: 'Artikel sains fitofarmaka, edukasi kesehatan alami, dan tips herbal terstandar dari para ahli PT. Al-Kautsar.',
    type: 'website',
  },
};

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function BlogPage() {
  const articlesResponse = await getArticles();
  
  const rawArticles = articlesResponse.success && articlesResponse.data 
    ? articlesResponse.data 
    : [];

  // Normalize data for client consumption
  const articles: ArticleItemData[] = rawArticles.map((art: any) => ({
    id: art.id,
    title: art.title,
    slug: art.slug,
    content: art.content || '',
    excerpt: art.excerpt || null,
    imageUrl: art.imageUrl || null,
    topic: (art as any).topic || null,
    createdAt: art.createdAt,
  }));

  return <BlogClient initialArticles={articles} />;
}
