/**
 * Centralized application constants
 */

// ============================================================
// ADMIN ROLES
// ============================================================
export const AdminRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
} as const;

export type AdminRole = typeof AdminRoles[keyof typeof AdminRoles];

// Valid admin roles (for auth checks)
export const VALID_ADMIN_ROLES = [
  AdminRoles.SUPER_ADMIN,
  AdminRoles.SUPERADMIN,
  AdminRoles.ADMIN,
  'admin', // legacy lowercase
] as const;

// ============================================================
// ORDER STATUSES (Synchronized with schema.prisma OrderStatus)
// ============================================================
export const OrderStatuses = {
  WAITING_FOR_PAYMENT: 'WAITING_FOR_PAYMENT',
  PROCESSING: 'PROCESSING',
  PREPARING: 'PREPARING',
  IN_DELIVERY: 'IN_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURNED: 'RETURNED',
} as const;

export type OrderStatus = typeof OrderStatuses[keyof typeof OrderStatuses];

// Payment Statuses (Synchronized with schema.prisma PaymentStatus)
export const PaymentStatuses = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
} as const;

export type PaymentStatus = typeof PaymentStatuses[keyof typeof PaymentStatuses];

// Final/terminal statuses
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  OrderStatuses.COMPLETED,
  OrderStatuses.CANCELLED,
  OrderStatuses.RETURNED,
];

// Statuses that count as "successful / in-progress"
export const SUCCESS_ORDER_STATUSES: OrderStatus[] = [
  OrderStatuses.PROCESSING,
  OrderStatuses.PREPARING,
  OrderStatuses.IN_DELIVERY,
  OrderStatuses.DELIVERED,
  OrderStatuses.COMPLETED,
];

// ============================================================
// PAGINATION
// ============================================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// ============================================================
// CACHE SETTINGS
// ============================================================
export const CACHE = {
  // Revalidation intervals in seconds
  PRODUCTS: 60,       // 1 minute
  CATEGORIES: 300,    // 5 minutes
  BANNERS: 300,       // 5 minutes
  SETTINGS: 600,     // 10 minutes
  ARTICLES: 300,      // 5 minutes
} as const;

// ============================================================
// VOUCHER TYPES
// ============================================================
export const VoucherTypes = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;

export type VoucherType = typeof VoucherTypes[keyof typeof VoucherTypes];

// ============================================================
// VOUCHER LIMITS
// ============================================================
export const VOUCHER_LIMITS = {
  CODE_MIN: 3,
  CODE_MAX: 50,
  VALUE_MAX: 999999,
  MIN_ORDER_MAX: 999999,
  MIN_PERCENTAGE: 1,
  MAX_PERCENTAGE: 100,
} as const;

// ============================================================
// SHIPPING RULES
// ============================================================
export const SHIPPING = {
  JAVA_PROVINCES: [
    'DKI Jakarta',
    'Jawa Barat',
    'Jawa Tengah',
    'DI Yogyakarta',
    'Jawa Timur',
    'Banten',
  ],
  OUTSIDE_JAVA_FEE: 30000,
} as const;

// ============================================================
// INQUIRY STATUSES
// ============================================================
export const InquiryStatuses = {
  NEW: 'NEW',
  READ: 'READ',
  REPLIED: 'REPLIED',
  CLOSED: 'CLOSED',
} as const;

export type InquiryStatus = typeof InquiryStatuses[keyof typeof InquiryStatuses];

// ============================================================
// USER ROLES
// ============================================================
export const UserRoles = {
  USER: 'USER',
  GUEST: 'GUEST',
} as const;

// ============================================================
// API PATHS (for middleware/redirects)
// ============================================================
export const API_PATHS = {
  ADMIN_PREFIX: '/api/admin',
  STORE_PREFIX: '/api/store',
  WEBHOOK_PREFIX: '/api/webhook',
} as const;

// ============================================================
// SESSION SETTINGS
// ============================================================
export const SESSION = {
  USER_COOKIE: 'session',
  ADMIN_COOKIE: 'admin_session',
  EXPIRY_DAYS: 7,
} as const;

// ============================================================
// VALIDATION LIMITS
// ============================================================
export const VALIDATION_LIMITS = {
  PRODUCT: {
    TITLE_MAX: 200,
    SLUG_MAX: 200,
    PRICE_MAX: 999999999,
    STOCK_MAX: 999999,
  },
  CATEGORY: {
    NAME_MAX: 100,
  },
  BANNER: {
    TITLE_MAX: 100,
    LINK_MAX: 500,
    BUTTON_TEXT_MAX: 50,
  },
  ARTICLE: {
    TITLE_MAX: 200,
    SLUG_MAX: 200,
    EXCERPT_MAX: 500,
    CONTENT_MIN: 10,
  },
} as const;
