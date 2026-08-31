import { z } from 'zod';

/**
 * Banner validation schemas
 */

export const bannerSchema = z.object({
  title: z.string()
    .min(3, 'Judul banner minimal 3 karakter')
    .max(200, 'Judul banner maksimal 200 karakter')
    .trim(),
  subtitle: z.string()
    .max(300, 'Subtitle maksimal 300 karakter')
    .optional()
    .default(''),
  link: z.string()
    .url('Link harus berupa URL yang valid')
    .or(z.literal('#'))
    .optional()
    .default('#'),
  buttonText: z.string()
    .max(50, 'Teks tombol maksimal 50 karakter')
    .optional()
    .default('Lihat Selengkapnya'),
  isActive: z.boolean().default(true),
  imageUrl: z.string()
    .url('URL gambar tidak valid')
    .or(z.string().min(1, 'URL gambar harus diisi')),
  publicId: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export type BannerData = z.infer<typeof bannerSchema>;

/**
 * Validate banner data
 */
export function validateBanner(data: unknown): { success: true; data: BannerData } | { success: false; errors: Record<string, string> } {
  const result = bannerSchema.safeParse(data);

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
