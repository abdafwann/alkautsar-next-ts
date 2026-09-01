/**
 * Product Form Types and Interfaces
 */

export interface ProductFormData {
  title: string;
  slug: string;
  uses: string;
  price: string;
  categoryId: string;
  productForm: string;
  composition: string;
  directions: string;
  warnings: string;
  certificate: string;
  quantity: string;
  isPromo: boolean;
  promoPercentage: string;
  promoPrice: string;
  promoExpiry: string;
}

export interface ProductImage {
  publicId: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface DraftData {
  formData: ProductFormData;
  images: ProductImage[];
}

export interface ProductFormProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    uses?: string | null;
    price?: { toString(): string } | number;
    categoryId?: string | null;
    productForm?: string | null;
    composition?: string | null;
    directions?: string | null;
    warnings?: string | null;
    certificate?: string | null;
    quantity?: { toString(): string } | number;
    isPromo?: boolean | null;
    promoPercentage?: { toString(): string } | number | null;
    promoPrice?: { toString(): string } | number | null;
    promoExpiry?: string | null;
    images?: Array<{ publicId: string; url: string; [key: string]: any }>;
  } | null;
  categories: Category[];
}

export const PRODUCT_FORM_OPTIONS = [
  { value: 'Kapsul', label: 'Kapsul Herbal' },
  { value: 'Cair / Minyak', label: 'Minyak Herbal / Tetes' },
  { value: 'Cair / Madu', label: 'Madu Herbal' },
  { value: 'Sirup', label: 'Sirup / Cair' },
  { value: 'Teh Celup', label: 'Teh Celup Herbal' },
  { value: 'Serbuk', label: 'Serbuk / Granul' },
  { value: 'Tablet', label: 'Tablet / Kaplet' },
  { value: 'Salep', label: 'Salep / Krim / Balsem' },
  { value: 'Lainnya', label: 'Lainnya' },
] as const;

export const DEFAULT_FORM_DATA: ProductFormData = {
  title: '',
  slug: '',
  uses: '',
  price: '',
  categoryId: '',
  productForm: 'Kapsul',
  composition: '',
  directions: '',
  warnings: '',
  certificate: '',
  quantity: '0',
  isPromo: false,
  promoPercentage: '',
  promoPrice: '',
  promoExpiry: '',
};
