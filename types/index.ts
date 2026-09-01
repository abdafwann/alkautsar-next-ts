/**
 * Shared TypeScript interfaces for the application
 * These provide type safety for function parameters and return types
 */

// ============================================================
// ORDER TYPES
// ============================================================

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  resi?: string;
  courier?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  count: number;
  price: number;
}

export interface OrderShipping {
  name: string | null;
  mobile: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  postalCode: string | null;
  note: string | null;
}

export interface Order {
  id: string;
  orderId: string | null;
  invoiceId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: Date;
  resi: string | null;
  courier: string | null;
  items: OrderItem[];
  shipping: OrderShipping;
}

// ============================================================
// PRODUCT TYPES
// ============================================================

export interface ProductInput {
  title: string | undefined;
  slug?: string | undefined;
  uses?: string | undefined;
  price: number | string | undefined;
  categoryId: string | undefined;
  composition?: string | null;
  directions?: string | null;
  warnings?: string | null;
  certificate?: string | undefined;
  quantity: number | string | undefined;
  isPromo?: boolean | string | undefined;
  promoPercentage?: number | string | null;
  promoPrice?: number | string | null;
  promoExpiry?: string | null;
  productForm?: string | undefined;
  tags?: string | null;
  images?: ProductImageInput[];
}

export interface ProductImageInput {
  url: string;
  publicId: string;
}

// ============================================================
// ARTICLE TYPES
// ============================================================

export interface ArticleInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  featuredImage?: ProductImageInput;
  topic?: string;
  imageUrl?: string;
  publicId?: string;
}

// ============================================================
// BANNER TYPES
// ============================================================

export interface BannerInput {
  title?: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
  isActive?: boolean;
  imageUrl: string;
  publicId: string;
  order?: number;
}

// ============================================================
// VOUCHER TYPES
// ============================================================

export interface VoucherInput {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  expiryDate: string;
  usageLimit?: number;
  isActive?: boolean;
}

// ============================================================
// CUSTOMER TYPES
// ============================================================

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  province?: string;
  city?: string;
  address?: string;
  isBlocked?: boolean;
  createdAt: Date;
  ordersCount?: number;
  totalSpent?: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// ADMIN TYPES
// ============================================================

export interface AdminPayload {
  adminId: string;
  email: string;
  role: string;
}

export interface AdminLogEntry {
  id: string;
  adminId: string;
  adminName?: string;
  action: string;
  details?: string;
  createdAt: Date;
}

// ============================================================
// FORM STATE TYPES
// ============================================================

export interface FormState {
  message?: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface PaginationFilters {
  page?: number;
  limit?: number;
}

export interface OrderFilters extends PaginationFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProductFilters extends PaginationFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}
