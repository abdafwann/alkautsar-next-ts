'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { saveDraft, getDraft, deleteDraft } from '@/app/actions/draft';
import type { ProductFormData, ProductImage, DraftData } from './types';

interface UseProductDraftOptions {
  isEditing: boolean;
  initialFormData?: ProductFormData;
  initialImages?: ProductImage[];
}

interface UseProductDraftReturn {
  formData: ProductFormData;
  images: ProductImage[];
  isRestoring: boolean;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
  clearDraft: () => Promise<void>;
}

/**
 * Custom hook for managing product form draft auto-save functionality
 * - Automatically saves to Redis every 1.5 seconds
 * - Restores draft on mount for new products
 * - Clears draft on successful save
 */
export function useProductDraft({
  isEditing,
  initialFormData,
  initialImages = [],
}: UseProductDraftOptions): UseProductDraftReturn {
  const [isRestoring, setIsRestoring] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData || {
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
  });
  const [images, setImages] = useState<ProductImage[]>(initialImages);

  // Restore draft on mount (only for new products)
  useEffect(() => {
    if (isEditing) {
      setIsRestoring(false);
      return;
    }

    getDraft().then((res) => {
      if (res.success && res.data) {
        let draftObj = res.data as DraftData | string;

        // Handle stringified draft
        if (typeof draftObj === 'string') {
          try {
            draftObj = JSON.parse(draftObj) as DraftData;
          } catch (e) {
            console.error('Failed to parse draft:', e);
          }
        }

        // Restore if valid draft structure
        if (draftObj && typeof draftObj === 'object' && 'formData' in draftObj) {
          const draft = draftObj as DraftData;
          setFormData(draft.formData);
          setImages(draft.images || []);
          toast.success('Draft yang belum tersimpan berhasil dipulihkan', { duration: 4000, icon: '♻️' });
        }
      }
      setIsRestoring(false);
    });
  }, [isEditing]);

  // Auto-save to Redis every 1.5 seconds
  useEffect(() => {
    if (isRestoring || isEditing) return;

    const timeout = setTimeout(() => {
      saveDraft({ formData, images });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [formData, images, isRestoring, isEditing]);

  // Clear draft after successful save
  const clearDraft = useCallback(async () => {
    if (!isEditing) {
      await deleteDraft();
    }
  }, [isEditing]);

  return {
    formData,
    images,
    isRestoring,
    setFormData,
    setImages,
    clearDraft,
  };
}
