import { getArticleBySlug, getArticles } from '@/app/actions/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { sanitizeHTMLWithSafeLinks } from '@/lib/sanitize';
import { 
  calculateReadTime, 
  extractExcerpt, 
  formatIndonesianDate, 
  inferArticleCategory 
} from '@/lib/blog-utils';
import ArticleShare from './ArticleShare';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getArticleBySlug(slug);

  if (!res.success || !res.data || !res.data.isPublished) {
    return {
      title: 'Artikel Tidak Ditemukan | PT. AL-KAUTSAR',
    };
  }

  const article = res.data;
  const description = article.excerpt || extractExcerpt(article.content, 160);

  return {
    title: `${article.title} | Jurnal Al-Kautsar`,
    description,
    openGraph: {
      title: `${article.title} | Jurnal Al-Kautsar`,
      description,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
    },
  };
}

export const revalidate = 60;

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const res = await getArticleBySlug(slug);

  if (!res.success || !res.data || !res.data.isPublished) {
    notFound();
  }

  const article = res.data;
  const category = inferArticleCategory(article);
  const readTime = calculateReadTime(article.content);
  const formattedDate = formatIndonesianDate(article.createdAt);

  // Fetch related stories
  const allArticlesRes = await getArticles();
  const relatedArticles = allArticlesRes.success && allArticlesRes.data
    ? allArticlesRes.data.filter((a: any) => a.id !== article.id).slice(0, 3)
    : [];

  return (
    <div className="bg-[#faf8f5] min-h-screen text-[#1c1917] pt-14 pb-28">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#e7e2d8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#78716c] hover:text-[#1c1917] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Jurnal Herbal</span>
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14">
        {/* Article Masthead */}
        <header className="mb-10 pb-8 border-b border-[#e7e2d8]">
          <div className="text-[11px] font-bold tracking-wider uppercase text-[#8B5A2B] mb-3">
            {category}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1c1917] leading-[1.2] mb-6">
            {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#78716c]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1c1917]">Tim Riset Al-Kautsar</span>
              <span>/</span>
              <time dateTime={article.createdAt.toISOString()}>{formattedDate}</time>
              <span>/</span>
              <span>{readTime}</span>
            </div>

            <ArticleShare title={article.title} />
          </div>
        </header>

        {/* Featured Image */}
        {article.imageUrl && (
          <figure className="mb-12">
            <div className="aspect-[16/9] bg-[#ebe5da] rounded-xl overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </figure>
        )}

        {/* Article Body */}
        <div
          className="prose prose-stone max-w-none text-[#292524] 
            prose-p:text-[15px] sm:prose-p:text-[16px] prose-p:leading-[1.8] prose-p:mb-6
            prose-headings:font-bold prose-headings:text-[#1c1917] prose-headings:tracking-tight
            prose-a:text-[#00AA5B] prose-a:font-semibold hover:prose-a:underline
            prose-blockquote:border-l-2 prose-blockquote:border-[#1c1917] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[#57534e]
            prose-ul:text-[#44403c] prose-ol:text-[#44403c]"
          dangerouslySetInnerHTML={{ __html: sanitizeHTMLWithSafeLinks(article.content) }}
        />

        {/* Medical & Scientific Editorial Disclaimer */}
        <div className="mt-14 p-6 bg-[#f3efe8] rounded-xl text-xs text-[#57534e] leading-relaxed border border-[#e7e2d8]">
          <p className="font-bold text-[#1c1917] mb-1">Catatan Redaksi & Edukasi Medis:</p>
          <p>
            Informasi dalam artikel ini disajikan untuk tujuan edukasi kesehatan dan pemahaman fitofarmaka herbal terstandar. Apabila Anda memiliki kondisi klinis khusus atau sedang dalam pengobatan rutin, konsultasikan terlebih dahulu dengan tenaga medis atau praktisi herbal kami sebelum penggunaan.
          </p>
        </div>

        {/* Consultation Callout */}
        <div className="mt-10 p-6 bg-white rounded-xl border border-[#e7e2d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1c1917] mb-1">
              Ada pertanyaan seputar topik ini?
            </h3>
            <p className="text-xs text-[#78716c]">
              Konsultasikan keluhan atau pertanyaan Anda langsung dengan tim herbalis Al-Kautsar.
            </p>
          </div>
          <a
            href={`https://wa.me/6281953453?text=Halo%20Admin%20Al-Kautsar,%20saya%20membaca%20artikel%20"${encodeURIComponent(article.title)}"%20dan%20ingin%20konsultasi`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#1c1917] hover:bg-[#00AA5B] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center"
          >
            Konsultasi via WhatsApp
          </a>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#e7e2d8]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1c1917]">
                Bacaan Terkait
              </h2>
              <Link
                href="/blog"
                className="text-xs font-semibold text-[#78716c] hover:text-[#1c1917] inline-flex items-center gap-1"
              >
                <span>Semua Artikel</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel: any) => {
                const relCat = inferArticleCategory(rel);
                const relDate = formatIndonesianDate(rel.createdAt);

                return (
                  <article key={rel.id} className="group">
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="block aspect-[16/10] bg-[#ebe5da] rounded-lg overflow-hidden mb-3"
                    >
                      {rel.imageUrl ? (
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#a8a29e]">
                          Artikel
                        </div>
                      )}
                    </Link>

                    <div className="text-[10px] font-bold uppercase text-[#8B5A2B] mb-1">
                      {relCat}
                    </div>

                    <Link href={`/blog/${rel.slug}`} className="block">
                      <h3 className="text-xs font-bold text-[#1c1917] group-hover:text-[#00AA5B] transition-colors leading-snug line-clamp-2 mb-1">
                        {rel.title}
                      </h3>
                    </Link>

                    <p className="text-[11px] text-[#78716c]">
                      {relDate}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
