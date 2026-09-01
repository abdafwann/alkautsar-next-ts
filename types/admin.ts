// ============================================================
// Admin Entity Types
// ============================================================

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  category?: Category;
  productForm?: string | null;
  images?: ProductImage[];
  isFeatured?: boolean;
  isPromo?: boolean | null;
  promoPercentage?: number | null;
  promoPrice?: number | null;
  promoExpiry?: Date | string | null;
  uses?: string;
  composition?: string | null;
  directions?: string;
  warnings?: string | null;
  certificate?: string;
}

export interface ProductImage {
  id?: string;
  publicId: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  expiryDate: Date | string;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  avatar?: string | null;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  isBlocked: boolean;
  createdAt: Date | string;
  totalOrders: number;
  totalSpent: number;
}

// ============================================================
// Form Types
// ============================================================

export interface ProductFormData {
  title: string;
  slug: string;
  price: string;
  quantity: string;
  categoryId: string;
  productForm: string;
  uses: string;
  composition: string;
  directions: string;
  warnings: string;
  certificate: string;
  isPromo: boolean;
  promoPercentage: string;
  promoPrice: string;
  promoExpiry: string;
}

export interface VoucherFormData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  minOrderAmount: string;
  maxDiscount?: string;
  expiryDate: string;
  usageLimit: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// Filter Types
// ============================================================

export type FilterOption = {
  value: string;
  label: string;
};

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface FilterState {
  search: string;
  [key: string]: string;
}

// ============================================================
// Reports Types
// ============================================================

export interface SalesReport {
  chartData: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  summary: {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    ordersGrowth: number;
    averageOrderValue: number;
  };
}

export interface TopProduct {
  id: string;
  title: string;
  image?: string | null | undefined;
  soldCount: number;
  revenue: number;
}
