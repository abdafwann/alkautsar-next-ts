import { z } from 'zod';

/**
 * Voucher validation schemas
 */

export const voucherSchema = z.object({
  code: z.string()
    .min(3, 'Kode voucher minimal 3 karakter')
    .max(50, 'Kode voucher maksimal 50 karakter')
    .regex(/^[A-Z0-9]+$/, 'Kode voucher hanya boleh huruf besar dan angka')
    .trim(),
  description: z.string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .default(''),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
    message: 'Tipe voucher tidak valid',
  }),
  value: z.number()
    .min(0, 'Nilai voucher tidak boleh negatif'),
  maxDiscount: z.number()
    .min(0, 'Diskon maksimal tidak boleh negatif')
    .optional()
    .nullable(),
  minPurchase: z.number()
    .min(0, 'Minimal pembelian tidak boleh negatif')
    .default(0),
  maxUses: z.number()
    .int('Maksimal penggunaan harus berupa angka bulat')
    .min(1, 'Maksimal penggunaan minimal 1')
    .optional()
    .nullable(),
  usedCount: z.number().int().min(0).default(0),
  validFrom: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Tanggal mulai tidak valid'),
  validUntil: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Tanggal akhir tidak valid'),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return new Date(data.validUntil) >= new Date(data.validFrom);
    }
    return true;
  },
  {
    message: 'Tanggal akhir harus setelah tanggal mulai',
    path: ['validUntil'],
  }
);

export type VoucherData = z.infer<typeof voucherSchema>;

/**
 * Validate voucher data
 */
export function validateVoucher(data: unknown): { success: true; data: VoucherData } | { success: false; errors: Record<string, string> } {
  const result = voucherSchema.safeParse(data);

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
