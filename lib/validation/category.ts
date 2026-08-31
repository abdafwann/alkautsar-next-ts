import { z } from 'zod';

/**
 * Category validation schemas
 */

export const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Nama kategori minimal 2 karakter')
    .max(100, 'Nama kategori maksimal 100 karakter')
    .trim()
    .refine(
      (val) => !/^\d+$/.test(val),
      'Nama kategori tidak boleh hanya berupa angka'
    ),
});

export const updateCategorySchema = createCategorySchema;

export type CategoryFormData = z.infer<typeof createCategorySchema>;

/**
 * Validate category data
 */
export function validateCategory(data: unknown): { success: true; data: CategoryFormData } | { success: false; errors: Record<string, string> } {
  const result = createCategorySchema.safeParse(data);

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
