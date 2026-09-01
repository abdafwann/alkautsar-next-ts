'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  imageUrl: string;
}

const DUMMY_ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    slug: 'cara-membedakan-ekstrak-herbal-vs-jamu-kasar',
    title: 'Cara Membedakan Ekstrak Herbal Terstandar vs Jamu Kasar',
    excerpt: 'Pahami perbedaan penting antara simplisia kasar yang berisiko mengendap di ginjal dengan ekstrak murni fitofarmaka yang cepat diserap tubuh.',
    category: 'Edukasi Herbal',
    readTime: '3 mnt baca',
    date: '28 Agu 2026',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'art-2',
    slug: 'pola-makan-alami-menjaga-gula-darah-stabil',
    title: '5 Pola Makan Alami untuk Menjaga Gula Darah Tetap Stabil',
    excerpt: 'Panduan praktis memilih karbohidrat kompleks, rempah penstabil insulin alami, dan jadwal makan terbaik untuk mencegah lonjakan glukosa.',
    category: 'Gula Darah & Nutrisi',
    readTime: '4 mnt baca',
    date: '24 Agu 2026',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'art-3',
    slug: 'tips-mencegah-penumpukan-asam-urat-usia-40',
    title: 'Tips Mencegah Penumpukan Asam Urat pada Usia 40 Tahun ke Atas',
    excerpt: 'Ketahui daftar makanan tinggi purin yang wajib dibatasi dan kebiasaan minum air putih hangat untuk melancarkan sirkulasi cairan sendi.',
    category: 'Kesehatan Sendi',
    readTime: '3 mnt baca',
    date: '19 Agu 2026',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
  },
];

export default function HealthArticlesV2() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-6 border-b border-[#e5dfd3]">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-2">
              Artikel Kesehatan Al-Kautsar
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight">
              Edukasi & Wawasan Sehat Alami
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-main hover:text-primary-green transition-colors group"
          >
            <span>Buka Semua Artikel</span>
            <ArrowUpRight size={16} className="text-text-main/60 group-hover:text-primary-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>

        {/* 3 Clean Magazine-Grade Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {DUMMY_ARTICLES.map((article) => (
            <article key={article.id} className="group flex flex-col justify-between">
              <div>
                {/* Photo Frame (Clear, un-tinted) */}
                <Link href={`/blog/${article.slug}`} className="block relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#f0eae1] mb-5 border border-[#e8e2d8]">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                  />
                </Link>

                {/* Metadata Line */}
                <div className="flex items-center gap-2 text-[11px] text-text-main/50 font-medium mb-2">
                  <span className="text-accent-brown font-bold">{article.category}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>

                {/* Title */}
                <Link href={`/blog/${article.slug}`}>
                  <h3 className="text-lg font-bold text-text-main group-hover:text-primary-green transition-colors leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-xs text-text-main/65 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              </div>

              {/* Minimal Link */}
              <div className="pt-4 mt-4 border-t border-[#f2eee6]">
                <Link
                  href={`/blog/${article.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-green hover:text-primary-green-hover transition-colors"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
