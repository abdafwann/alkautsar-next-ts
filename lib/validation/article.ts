import { z } from 'zod';

/**
 * Article/Blog validation schemas
 */

export const articleSchema = z.object({
  title: z.string()
    .min(10, 'Judul artikel minimal 10 karakter')
    .max(300, 'Judul artikel maksimal 300 karakter')
    .trim(),
  slug: z.string()
    .min(3, 'Slug minimal 3 karakter')
    .max(300, 'Slug maksimal 300 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung')
    .trim(),
  content: z.string()
    .min(50, 'Konten artikel minimal 50 karakter'),
  excerpt: z.string()
    .max(500, 'Ringkasan maksimal 500 karakter')
    .optional()
    .default(''),
  category: z.string()
    .max(100, 'Kategori maksimal 100 karakter')
    .optional()
    .default(''),
  tags: z.string()
    .max(300, 'Tags maksimal 300 karakter')
    .optional()
    .default(''),
  featuredImage: z.object({
    url: z.string().url('URL gambar tidak valid'),
    publicId: z.string().optional(),
  }).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export type ArticleData = z.infer<typeof articleSchema>;

/**
 * Validate article data
 */
export function validateArticle(data: unknown): { success: true; data: ArticleData } | { success: false; errors: Record<string, string> } {
  const result = articleSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}
