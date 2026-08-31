'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin, withAdminAuth } from '@/lib/auth-guard';
import { logAdminActivity } from '@/lib/adminLog';
import { validateArticle, sanitizeString } from '@/lib/validation';
import type { ArticleInput } from '@/types';

export const getArticles = async (includeUnpublished = false) => {
  try {
    // If requesting unpublished drafts, enforce admin authorization
    if (includeUnpublished) {
      await requireAdmin();
    }

    const articles = await prisma.article.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: articles };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil artikel' };
  }
};

export const getArticleBySlug = async (slug: string) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug }
    });
    if (!article) return { success: false, error: 'Artikel tidak ditemukan' };
    return { success: true, data: article };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil artikel' };
  }
};

export const getArticleById = withAdminAuth(async (payload, id: string) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id }
    });
    if (!article) return { success: false, error: 'Artikel tidak ditemukan' };
    return { success: true, data: article };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengambil artikel' };
  }
});

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const createArticle = withAdminAuth(async (payload, data: ArticleInput) => {
  const adminId = payload.adminId;
  try {
    const validation = validateArticle({
      title: sanitizeString(data.title),
      slug: generateSlug(sanitizeString(data.title)),
      content: data.content,
      featuredImage: data.featuredImage,
      isPublished: data.isPublished || false,
    } as Parameters<typeof validateArticle>[0]);

    if (!validation.success) {
      const errors = Object.values(validation.errors).join(', ');
      return { success: false, error: `Validasi gagal: ${errors}` };
    }

    let slug = validation.data.slug;

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await prisma.article.create({
      data: {
        title: validation.data.title,
        slug,
        content: validation.data.content,
        excerpt: data.excerpt ? sanitizeString(data.excerpt) : null,
        imageUrl: validation.data.featuredImage?.url,
        imagePublicId: validation.data.featuredImage?.publicId,
        isPublished: validation.data.isPublished
      }
    });

    await logAdminActivity(adminId, 'CREATE_ARTICLE', `Menulis artikel baru: ${article.title}`);

    revalidatePath('/blog');
    revalidatePath('/admin/articles');

    return { success: true, data: article };
  } catch (error: any) {
    console.error('Create article error:', error);
    return { success: false, error: error.message || 'Gagal membuat artikel' };
  }
});

export const updateArticle = withAdminAuth(async (payload, id: string, data: ArticleInput) => {
  const adminId = payload.adminId;
  try {
    const validation = validateArticle({
      title: sanitizeString(data.title),
      slug: generateSlug(sanitizeString(data.title)),
      content: data.content,
      featuredImage: data.featuredImage,
      isPublished: data.isPublished || false,
    } as Parameters<typeof validateArticle>[0]);

    if (!validation.success) {
      const errors = Object.values(validation.errors).join(', ');
      return { success: false, error: `Validasi gagal: ${errors}` };
    }

    let slug = validation.data.slug;

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: validation.data.title,
        slug,
        content: validation.data.content,
        excerpt: data.excerpt ? sanitizeString(data.excerpt) : null,
        imageUrl: validation.data.featuredImage?.url,
        imagePublicId: validation.data.featuredImage?.publicId,
        isPublished: validation.data.isPublished
      }
    });

    await logAdminActivity(adminId, 'UPDATE_ARTICLE', `Memperbarui artikel: ${article.title}`);

    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath('/admin/articles');

    return { success: true, data: article };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memperbarui artikel' };
  }
});

export const deleteArticle = withAdminAuth(async (payload, id: string) => {
  const adminId = payload.adminId;
  try {
    const article = await prisma.article.delete({
      where: { id }
    });

    await logAdminActivity(adminId, 'DELETE_ARTICLE', `Menghapus artikel: ${article.title}`);
    
    revalidatePath('/blog');
    revalidatePath('/admin/articles');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus artikel' };
  }
});
