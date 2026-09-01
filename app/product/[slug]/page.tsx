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

  const now = new Date();

  // Validasi apakah promo produk saat ini masih aktif dan belum melewati batas waktu kadaluarsa (promoExpiry)
  const isCurrentProductPromoActive = Boolean(
    product.isPromo &&
    product.promoPrice &&
    (!product.promoExpiry || new Date(product.promoExpiry) >= now)
  );

  // Next.js tidak bisa mengirim objek Prisma 'Decimal' ke Client Component,
  // sehingga kita harus mengubah harganya menjadi angka biasa (plain number) terlebih dahulu.
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    promoPrice: isCurrentProductPromoActive ? Number(product.promoPrice) : null,
    promoPercentage: isCurrentProductPromoActive ? product.promoPercentage : null,
    isPromo: isCurrentProductPromoActive,
  };

  const serializedRelatedProducts = relatedProducts.map(p => {
    const isRelatedPromoActive = Boolean(
      p.isPromo &&
      p.promoPrice &&
      (!p.promoExpiry || new Date(p.promoExpiry) >= now)
    );

    return {
      ...p,
      price: Number(p.price),
      promoPrice: isRelatedPromoActive ? Number(p.promoPrice) : null,
      promoPercentage: isRelatedPromoActive ? p.promoPercentage : null,
      isPromo: isRelatedPromoActive,
    };
  });

  return <ProductDetailClient product={serializedProduct} relatedProducts={serializedRelatedProducts} />;
}
