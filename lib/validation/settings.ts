import { z } from 'zod';

/**
 * Settings validation schemas
 */

export const settingsSchema = z.object({
  storeName: z.string()
    .min(2, 'Nama toko minimal 2 karakter')
    .max(200, 'Nama toko maksimal 200 karakter')
    .trim(),
  storeDescription: z.string()
    .max(1000, 'Deskripsi toko maksimal 1000 karakter')
    .optional()
    .default(''),
  email: z.string()
    .email('Email tidak valid')
    .or(z.string().max(0))
    .optional(),
  phone: z.string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .regex(/^[0-9+\-\s()]*$/, 'Nomor telepon tidak valid')
    .optional()
    .default(''),
  address: z.string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .default(''),
  socialMedia: z.object({
    facebook: z.string().url('URL Facebook tidak valid').optional().or(z.literal('')),
    instagram: z.string().url('URL Instagram tidak valid').optional().or(z.literal('')),
    twitter: z.string().url('URL Twitter tidak valid').optional().or(z.literal('')),
    whatsapp: z.string().max(20).optional().default(''),
  }).optional().default({ facebook: '', instagram: '', twitter: '', whatsapp: '' }),
  operatingHours: z.object({
    monday: z.string().max(100).optional().default(''),
    tuesday: z.string().max(100).optional().default(''),
    wednesday: z.string().max(100).optional().default(''),
    thursday: z.string().max(100).optional().default(''),
    friday: z.string().max(100).optional().default(''),
    saturday: z.string().max(100).optional().default(''),
    sunday: z.string().max(100).optional().default(''),
  }).optional().default({ monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' }),
});

export type SettingsData = z.infer<typeof settingsSchema>;

/**
 * Validate settings data
 */
export function validateSettings(data: unknown): { success: true; data: SettingsData } | { success: false; errors: Record<string, string> } {
  const result = settingsSchema.safeParse(data);

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
 * Inquiry validation schemas
 */

export const inquirySchema = z.object({
  name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .trim(),
  email: z.string()
    .email('Email tidak valid'),
  phone: z.string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .regex(/^[0-9+\-\s()]*$/, 'Nomor telepon tidak valid')
    .optional()
    .default(''),
  subject: z.string()
    .min(5, 'Subjek minimal 5 karakter')
    .max(200, 'Subjek maksimal 200 karakter')
    .trim(),
  message: z.string()
    .min(20, 'Pesan minimal 20 karakter')
    .max(5000, 'Pesan maksimal 5000 karakter')
    .trim(),
});

export type InquiryData = z.infer<typeof inquirySchema>;

/**
 * Validate inquiry data
 */
export function validateInquiry(data: unknown): { success: true; data: InquiryData } | { success: false; errors: Record<string, string> } {
  const result = inquirySchema.safeParse(data);

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
