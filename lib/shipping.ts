import { SHIPPING } from '@/lib/constants';

export interface ShippingCalculationParams {
  province?: string | null;
  city?: string | null;
  weightGrams?: number;
  subtotal?: number;
}

export interface ShippingCalculationResult {
  shippingFee: number;
  isFreeShipping: boolean;
  courierService: string;
  isJava: boolean;
}

/**
 * Authoritative Server-side Shipping Calculator (Prototype)
 * 
 * NOTE: Untuk implementasi API dinamis (misal RajaOngkir / Biteship / JNE),
 * sesuaikan logic di dalam fungsi ini tanpa mengubah controller checkout.
 */
export function calculateShippingFee(params: ShippingCalculationParams): ShippingCalculationResult {
  const { province = '' } = params;
  const cleanProvince = (province || '').trim();

  const isJava = (SHIPPING.JAVA_PROVINCES as readonly string[]).some(
    (p) => p.toLowerCase() === cleanProvince.toLowerCase()
  );

  // Prototype Logic:
  // - Pulau Jawa: Gratis Ongkir (Rp 0)
  // - Luar Pulau Jawa: Flat rate prototype (Rp 30.000)
  const shippingFee = isJava ? 0 : SHIPPING.OUTSIDE_JAVA_FEE;

  return {
    shippingFee,
    isFreeShipping: shippingFee === 0,
    courierService: isJava ? 'Al-Kautsar Regular Express (Jawa Free)' : 'Al-Kautsar Standar Antar Pulau',
    isJava,
  };
}
