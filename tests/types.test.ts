/**
 * Tests for types/index.ts
 * Verifies that TypeScript interfaces are correctly structured
 */

import { describe, it, expect } from 'vitest';

// Import types to verify they compile correctly
import type {
  ProductInput,
  ArticleInput,
  Order,
  OrderItem,
  OrderFilters,
  PaginationFilters,
  ApiResponse,
} from '../types';

describe('Type Interfaces', () => {
  describe('ProductInput', () => {
    it('should accept valid product input', () => {
      const product: ProductInput = {
        title: 'Test Product',
        price: 100000,
        categoryId: 'cat-123',
        quantity: 10,
      };

      expect(product.title).toBe('Test Product');
      expect(product.price).toBe(100000);
      expect(product.quantity).toBe(10);
    });

    it('should accept optional fields', () => {
      const product: ProductInput = {
        title: 'Test Product',
        price: '100000', // Can be string from form input
        categoryId: 'cat-123',
        quantity: 10,
        isPromo: true,
        promoPercentage: 10,
        images: [{ url: 'https://example.com/img.jpg', publicId: 'abc123' }],
      };

      expect(product.isPromo).toBe(true);
      expect(product.promoPercentage).toBe(10);
      expect(product.images?.length).toBe(1);
    });

    it('should accept null/undefined for optional fields', () => {
      const product: ProductInput = {
        title: 'Test Product',
        price: 100000,
        categoryId: undefined,
        quantity: 10,
        composition: null,
        directions: undefined,
      };

      expect(product.composition).toBeNull();
      expect(product.directions).toBeUndefined();
    });
  });

  describe('ArticleInput', () => {
    it('should accept valid article input', () => {
      const article: ArticleInput = {
        title: 'Test Article',
        content: 'This is the article content',
        topic: 'Health',
        imageUrl: 'https://example.com/image.jpg',
        publicId: 'img-123',
      };

      expect(article.title).toBe('Test Article');
      expect(article.topic).toBe('Health');
      expect(article.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should accept featuredImage object', () => {
      const article: ArticleInput = {
        title: 'Test Article',
        content: 'Content here',
        featuredImage: {
          url: 'https://example.com/featured.jpg',
          publicId: 'featured-123',
        },
      };

      expect(article.featuredImage?.url).toBe('https://example.com/featured.jpg');
    });
  });

  describe('Order', () => {
    it('should accept valid order structure', () => {
      const order: Order = {
        id: 'order-123',
        orderId: 'ORD-001',
        invoiceId: null,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        status: 'PAID',
        paymentStatus: 'PAID',
        total: 150000,
        createdAt: new Date(),
        resi: null,
        courier: null,
        items: [
          { id: 'item-1', name: 'Product 1', count: 2, price: 75000 },
        ],
        shipping: {
          name: 'John Doe',
          mobile: '081234567890',
          address: 'Jl. Test No. 1',
          province: 'DKI Jakarta',
          city: 'Jakarta',
          postalCode: '12345',
          note: null,
        },
      };

      expect(order.orderId).toBe('ORD-001');
      expect(order.items.length).toBe(1);
      expect(order.shipping.city).toBe('Jakarta');
    });
  });

  describe('PaginationFilters', () => {
    it('should accept pagination parameters', () => {
      const filters: PaginationFilters = {
        page: 1,
        limit: 20,
      };

      expect(filters.page).toBe(1);
      expect(filters.limit).toBe(20);
    });

    it('should accept empty filters', () => {
      const filters: PaginationFilters = {};

      expect(filters.page).toBeUndefined();
      expect(filters.limit).toBeUndefined();
    });
  });

  describe('OrderFilters', () => {
    it('should accept order-specific filters', () => {
      const filters: OrderFilters = {
        page: 2,
        limit: 15,
        search: 'John',
        status: 'PAID',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      };

      expect(filters.search).toBe('John');
      expect(filters.status).toBe('PAID');
    });
  });

  describe('ApiResponse', () => {
    it('should accept success response with data', () => {
      const response: ApiResponse<string[]> = {
        success: true,
        data: ['item1', 'item2'],
      };

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
    });

    it('should accept error response', () => {
      const response: ApiResponse = {
        success: false,
        error: 'Something went wrong',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
    });
  });
});
