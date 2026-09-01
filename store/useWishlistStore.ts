import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  imageUrl: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  setWishlist: (items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },

      toggleItem: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((i) => i.id !== item.id) }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      clearWishlist: () => set({ items: [] }),

      setWishlist: (items) => set({ items }),
    }),
    {
      name: 'alkautsar-wishlist',
    }
  )
);
