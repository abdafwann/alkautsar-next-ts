import { useState, useCallback, useMemo } from 'react';

export interface UseSearchFilterOptions<T> {
  items: T[];
  searchKeys: (keyof T)[];
  initialFilters?: Record<string, string>;
}

export interface UseSearchFilterReturn<T> {
  search: string;
  filters: Record<string, string>;
  filteredItems: T[];
  setSearch: (search: string) => void;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
  resetAll: () => void;
}

export function useSearchFilter<T>({
  items,
  searchKeys,
  initialFilters = {},
}: UseSearchFilterOptions<T>): UseSearchFilterReturn<T> {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = searchKeys.some((key) => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // Additional filters (for specific filter keys)
      for (const [filterKey, filterValue] of Object.entries(filters)) {
        if (filterValue === 'ALL') continue;
        if (filterValue === '') continue;

        const itemValue = (item as Record<string, unknown>)[filterKey];
        const itemValueStr = String(itemValue ?? '').toLowerCase();
        const filterValueLower = filterValue.toLowerCase();

        // Handle special cases like stock levels
        if (filterKey === 'quantity') {
          const qty = Number(itemValue);
          if (filterValue === 'LOW' && qty > 5) return false;
          if (filterValue === 'AVAILABLE' && qty <= 5) return false;
          continue;
        }

        // Handle promo filter
        if (filterKey === 'promo') {
          const hasPromo = Boolean((item as Record<string, unknown>).isPromo);
          if (filterValue === 'PROMO' && !hasPromo) return false;
          if (filterValue === 'NORMAL' && hasPromo) return false;
          continue;
        }

        // Handle status filter for customers
        if (filterKey === 'status') {
          const isBlocked = Boolean((item as Record<string, unknown>).isBlocked);
          if (filterValue === 'ACTIVE' && isBlocked) return false;
          if (filterValue === 'BLOCKED' && !isBlocked) return false;
          continue;
        }

        // Default: exact match
        if (itemValueStr !== filterValueLower) return false;
      }

      return true;
    });
  }, [items, search, searchKeys, filters]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const resetAll = useCallback(() => {
    setSearch('');
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    search,
    filters,
    filteredItems,
    setSearch,
    setFilter,
    resetFilters,
    resetAll,
  };
}
