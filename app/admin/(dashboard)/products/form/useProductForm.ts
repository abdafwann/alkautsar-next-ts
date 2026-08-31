'use client';

import { useState, useCallback } from 'react';
import { deleteDraft } from '@/app/actions/draft';
import type { ProductFormData, ProductImage } from './types';

interface UseProductFormOptions {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    uses?: string;
    price?: { toString(): string };
    categoryId?: string;
    productForm?: string;
    composition?: string;
    directions?: string;
    warnings?: string;
    certificate?: string;
    quantity?: { toString(): string };
    isPromo?: boolean;
    promoPercentage?: { toString(): string };
    promoPrice?: { toString(): string };
    promoExpiry?: string;
    images?: Array<{ publicId: string; url: string }>;
  };
  categories?: Array<{ id: string; name: string }>;
}

interface UseProductFormReturn {
  formData: ProductFormData;
  images: ProductImage[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isRestoring: boolean;
  setFormData: (updates: Partial<ProductFormData>) => void;
  setImages: (images: ProductImage[]) => void;
  clearDraft: () => Promise<void>;
}

const DEFAULT_FORM_DATA: ProductFormData = {
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

/**
 * Hook for managing product form state and draft auto-save
 */
export function useProductForm(
  options: UseProductFormOptions = {}
): UseProductFormReturn {
  const { initialData, categories = [] } = options;
  const isEditing = !!initialData?.id;

  // Initialize form data from initialData
  const getInitialFormData = (): ProductFormData => {
    if (initialData) {
      return {
        title: initialData.title || '',
        slug: initialData.slug || '',
        uses: initialData.uses || '',
        price: initialData.price?.toString() || '',
        categoryId: initialData.categoryId || categories[0]?.id || '',
        productForm: initialData.productForm || 'Kapsul',
        composition: initialData.composition || '',
        directions: initialData.directions || '',
        warnings: initialData.warnings || '',
        certificate: initialData.certificate || '',
        quantity: initialData.quantity?.toString() || '0',
        isPromo: initialData.isPromo || false,
        promoPercentage: initialData.promoPercentage?.toString() || '',
        promoPrice: initialData.promoPrice?.toString() || '',
        promoExpiry: initialData.promoExpiry
          ? new Date(initialData.promoExpiry).toISOString().split('T')[0]
          : '',
      };
    }
    return {
      ...DEFAULT_FORM_DATA,
      categoryId: categories[0]?.id || '',
    };
  };

  const [formData, _setFormData] = useState<ProductFormData>(getInitialFormData());

  // Functional setter for partial updates
  const setFormData = (updates: Partial<ProductFormData>) => {
    _setFormData((prev) => ({ ...prev, ...updates }));
  };

  const imagesInit: ProductImage[] = initialData?.images?.map((img) => ({
    publicId: img.publicId,
    url: img.url,
  })) || [];
  const [_images, _setImages] = useState<ProductImage[]>(imagesInit);
  const setImages = (imgs: ProductImage[]) => _setImages(imgs);

  const [isRestoring] = useState(!isEditing);
  const [isLoading, _setIsLoading] = useState(false);
  const setIsLoading = (loading: boolean) => _setIsLoading(loading);

  // Clear draft after successful save
  const clearDraft = useCallback(async () => {
    if (!isEditing) {
      try {
        await deleteDraft();
      } catch (err) {
        console.error('Failed to clear draft:', err);
      }
    }
  }, [isEditing]);

  return {
    formData,
    images: _images,
    isLoading,
    setIsLoading,
    isRestoring,
    setFormData,
    setImages,
    clearDraft,
  };
}
