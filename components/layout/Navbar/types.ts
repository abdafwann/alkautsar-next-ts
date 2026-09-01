/**
 * Navbar Types and Interfaces
 * Centralized type definitions for Navbar components
 */

export interface User {
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface StoreInfo {
  name: string;
  email: string;
  whatsapp: string;
  announcementText?: string | null;
  announcementLink?: string | null;
  announcementActive?: boolean;
}

export interface SearchProduct {
  id: string;
  title: string;
  slug: string;
  category?: { name: string } | null;
  images?: Array<{ url: string }>;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
}

export type DropdownType = 'cart' | 'wishlist' | 'profile' | 'category' | null;

export interface NavbarContext {
  user: User | null;
  categories: Category[];
  storeInfo: StoreInfo;
  isSyncing: boolean;
  isMobileMenuOpen: boolean;
  activeDropdown: DropdownType;
  setActiveDropdown: (dropdown: DropdownType) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
}

export interface DropdownWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
}
