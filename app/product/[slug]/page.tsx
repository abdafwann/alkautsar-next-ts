import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: { category: true }
  });

  if (!product) {
    return { title: 'Produk Tidak Ditemukan' };
  }

  return {
    title: `${product.title} | PT. Al-Kautsar`,
    description: product.uses,
    openGraph: {
      title: product.title,
      description: product.uses,
      type: 'website',
    }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  
  // Ambil detail produk saat ini
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      category: true,
      images: true,
    }
  });

  if (!product) {
    notFound();
  }

  // Ambil beberapa produk lain (sebagai produk terkait)
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categoryId: product.categoryId,
      id: { not: product.id } // Jangan tampilkan produk ini sendiri
    },
    include: {
      images: true
    },
    take: 5
  });

  // Next.js tidak bisa mengirim objek Prisma 'Decimal' ke Client Component,
  // sehingga kita harus mengubah harganya menjadi angka biasa (plain number) terlebih dahulu.
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    promoPrice: product.promoPrice ? Number(product.promoPrice) : null,
  };

  const serializedRelatedProducts = relatedProducts.map(p => ({
    ...p,
    price: Number(p.price),
    promoPrice: p.promoPrice ? Number(p.promoPrice) : null,
  }));

  return <ProductDetailClient product={serializedProduct} relatedProducts={serializedRelatedProducts} />;
}
