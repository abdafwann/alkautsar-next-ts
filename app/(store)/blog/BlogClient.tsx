'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';
import { 
  calculateReadTime, 
  extractExcerpt, 
  formatIndonesianDate, 
  inferArticleCategory 
} from '@/lib/blog-utils';

export interface ArticleItemData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  topic?: string | null;
  createdAt: string | Date;
}

interface BlogClientProps {
  initialArticles: ArticleItemData[];
}

export default function BlogClient({ initialArticles }: BlogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialArticles.forEach((art) => {
      set.add(inferArticleCategory(art));
    });
    return ['Semua', ...Array.from(set)];
  }, [initialArticles]);

  // Filter logic
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const category = inferArticleCategory(article);
      const matchesCategory = selectedCategory === 'Semua' || category === selectedCategory;

      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const titleMatch = article.title.toLowerCase().includes(q);
      const contentMatch = article.content.toLowerCase().includes(q);
      const excerptMatch = article.excerpt?.toLowerCase().includes(q) || false;

      return titleMatch || contentMatch || excerptMatch;
    });
  }, [initialArticles, selectedCategory, searchQuery]);

  const isDefaultView = selectedCategory === 'Semua' && !searchQuery.trim();
  const leadArticle = isDefaultView && filteredArticles.length > 0 ? filteredArticles[0] : null;
  const standardArticles = leadArticle ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="bg-[#faf8f5] min-h-screen text-[#1c1917] pt-14 pb-28">
      {/* Masthead */}
      <header className="border-b border-[#e7e2d8] bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e7e2d8]">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.25em] text-[#78716c] uppercase mb-2">
                Publikasi & Edukasi Sehat Alami
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1c1917]">
                Jurnal Herbal
              </h1>
            </div>

            <p className="text-sm text-[#57534e] max-w-md leading-relaxed">
              Kajian mendalam seputar riset fitofarmaka terstandar, nutrisi metabolisme, dan panduan kesehatan keluarga.
            </p>
          </div>

          {/* Navigation Bar & Search */}
          <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Text Tabs */}
            <nav className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-none" aria-label="Kategori Artikel">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-semibold whitespace-nowrap pb-1 transition-colors relative ${
                      active
                        ? 'text-[#1c1917] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1c1917]'
                        : 'text-[#78716c] hover:text-[#1c1917]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>

            {/* Clean Minimal Search */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-[#d6cfc4] rounded-lg text-xs text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#1c1917] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#1c1917]"
                  aria-label="Hapus pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Journal Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {filteredArticles.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#1c1917] mb-2">Tidak ada artikel ditemukan</h2>
            <p className="text-xs text-[#78716c] leading-relaxed mb-6">
              Tidak ditemukan artikel untuk pencarian &quot;{searchQuery}&quot;. Silakan coba topik atau kata kunci lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="text-xs font-semibold text-[#1c1917] underline hover:text-[#00AA5B] transition-colors"
            >
              Tampilkan semua artikel
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Lead Story (Editorial Asymmetric Layout) */}
            {leadArticle && (
              <article className="border-b border-[#e7e2d8] pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  <div className="lg:col-span-7">
                    <Link
                      href={`/blog/${leadArticle.slug}`}
                      className="block aspect-[16/10] bg-[#ebe5da] rounded-xl overflow-hidden group"
                    >
                      {leadArticle.imageUrl ? (
                        <img
                          src={leadArticle.imageUrl}
                          alt={leadArticle.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#a8a29e]">
                          Foto Artikel
                        </div>
                      )}
                    </Link>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="text-[11px] font-bold tracking-wider uppercase text-[#8B5A2B] mb-3">
                      {inferArticleCategory(leadArticle)}
                    </div>

                    <Link href={`/blog/${leadArticle.slug}`} className="group block">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1c1917] group-hover:text-[#00AA5B] transition-colors leading-[1.2] mb-4">
                        {leadArticle.title}
                      </h2>
                    </Link>

                    <p className="text-[#57534e] text-sm leading-relaxed mb-6">
                      {leadArticle.excerpt || extractExcerpt(leadArticle.content, 200)}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#78716c] pt-4 border-t border-[#e7e2d8]">
                      <span>{formatIndonesianDate(leadArticle.createdAt)}</span>
                      <span>/</span>
                      <span>{calculateReadTime(leadArticle.content)}</span>
                      <span>/</span>
                      <span>Tim Riset Al-Kautsar</span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Standard Article Flow */}
            {standardArticles.length > 0 && (
              <section aria-label="Artikel Lainnya">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {standardArticles.map((article) => {
                    const cat = inferArticleCategory(article);
                    const readTime = calculateReadTime(article.content);
                    const date = formatIndonesianDate(article.createdAt);
                    const excerpt = article.excerpt || extractExcerpt(article.content, 120);

                    return (
                      <article key={article.id} className="flex flex-col justify-between group">
                        <div>
                          <Link
                            href={`/blog/${article.slug}`}
                            className="block aspect-[16/10] bg-[#ebe5da] rounded-xl overflow-hidden mb-4"
                          >
                            {article.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-[#a8a29e]">
                                Al-Kautsar
                              </div>
                            )}
                          </Link>

                          <div className="text-[10px] font-bold tracking-wider uppercase text-[#8B5A2B] mb-2">
                            {cat}
                          </div>

                          <Link href={`/blog/${article.slug}`} className="block">
                            <h3 className="text-lg font-bold text-[#1c1917] group-hover:text-[#00AA5B] transition-colors leading-snug mb-2 line-clamp-2">
                              {article.title}
                            </h3>
                          </Link>

                          <p className="text-xs text-[#57534e] leading-relaxed line-clamp-3 mb-4">
                            {excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#e7e2d8] flex items-center justify-between text-[11px] text-[#78716c]">
                          <span>{date}</span>
                          <span>{readTime}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Editorial Footer Note */}
        <div className="mt-24 pt-10 border-t border-[#e7e2d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#78716c]">
          <p>
            Diterbitkan oleh Divisi Edukasi PT. Al-Kautsar Perkasa Indonesia.
          </p>
          <a
            href="https://wa.me/6281953453"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#1c1917] hover:text-[#00AA5B] transition-colors inline-flex items-center gap-1"
          >
            <span>Konsultasi Pertanyaan Herbal</span>
            <ArrowRight size={13} />
          </a>
        </div>
      </main>
    </div>
  );
}
