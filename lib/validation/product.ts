import { z } from 'zod';

/**
 * Product validation schemas
 */

// Product form data schema
export const productFormSchema = z.object({
  title: z.string()
    .min(3, 'Nama produk minimal 3 karakter')
    .max(200, 'Nama produk maksimal 200 karakter')
    .trim(),
  slug: z.string()
    .min(3, 'Slug minimal 3 karakter')
    .max(200, 'Slug maksimal 200 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung')
    .trim(),
  uses: z.string()
    .min(10, 'Deskripsi kegunaan minimal 10 karakter')
    .max(2000, 'Deskripsi kegunaan maksimal 2000 karakter')
    .trim(),
  price: z.number()
    .min(0, 'Harga tidak boleh negatif')
    .max(999999999, 'Harga terlalu besar'),
  categoryId: z.string()
    .min(1, 'Kategori harus dipilih'),
  productForm: z.string()
    .min(1, 'Bentuk sediaan harus dipilih')
    .max(50, 'Bentuk sediaan maksimal 50 karakter')
    .trim(),
  composition: z.string()
    .max(2000, 'Komposisi maksimal 2000 karakter')
    .optional()
    .default(''),
  directions: z.string()
    .min(5, 'Aturan pakai minimal 5 karakter')
    .max(1000, 'Aturan pakai maksimal 1000 karakter')
    .trim(),
  warnings: z.string()
    .max(1000, 'Peringatan maksimal 1000 karakter')
    .optional()
    .default(''),
  certificate: z.string()
    .min(5, 'Nomor izin edar minimal 5 karakter')
    .max(100, 'Nomor izin edar maksimal 100 karakter')
    .trim(),
  quantity: z.number()
    .int('Stok harus berupa angka bulat')
    .min(0, 'Stok tidak boleh negatif')
    .max(999999, 'Stok terlalu besar'),
  isPromo: z.boolean().default(false),
  promoPercentage: z.number()
    .min(0, 'Persentase diskon tidak boleh negatif')
    .max(100, 'Persentase diskon maksimal 100%')
    .optional()
    .nullable(),
  promoPrice: z.number()
    .min(0, 'Harga promo tidak boleh negatif')
    .optional()
    .nullable(),
  promoExpiry: z.string()
    .optional()
    .nullable(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Product image schema
export const productImageSchema = z.object({
  publicId: z.string().min(1, 'Public ID harus diisi'),
  url: z.string().url('URL gambar tidak valid'),
});

export type ProductImageData = z.infer<typeof productImageSchema>;

/**
 * Validate product data
 */
export function validateProduct(data: unknown): { success: true; data: ProductFormData } | { success: false; errors: Record<string, string> } {
  const result = productFormSchema.safeParse(data);

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

/**
 * Validate product images
 */
export function validateProductImages(images: unknown): { success: true; data: ProductImageData[] } | { success: false; errors: string } {
  if (!Array.isArray(images)) {
    return { success: false, errors: 'Gambar harus berupa array' };
  }

  const result = z.array(productImageSchema).safeParse(images);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error.issues[0]?.message || 'Format gambar tidak valid' };
}

/**
 * Input length limits (for server-side enforcement)
 */
export const INPUT_LIMITS = {
  TITLE_MAX: 200,
  SLUG_MAX: 200,
  USES_MAX: 2000,
  COMPOSITION_MAX: 2000,
  DIRECTIONS_MAX: 1000,
  WARNINGS_MAX: 1000,
  CERTIFICATE_MAX: 100,
  STOCK_MAX: 999999,
  PRICE_MAX: 999999999,
  PROMO_PERCENTAGE_MAX: 100,
  IMAGES_MAX: 10,
} as const;

/**
 * Validate input length (for server-side enforcement)
 */
export function validateInputLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value.length > maxLength) {
    return `${fieldName} maksimal ${maxLength} karakter`;
  }
  return null;
}
