import { useMemo, useCallback } from 'react';
import { usePagination, UsePaginationOptions } from './usePagination';
import { useSearchFilter, UseSearchFilterOptions } from './useSearchFilter';

export interface UseDataTableOptions<T>
  extends Omit<UsePaginationOptions, 'itemsPerPage'>,
    Omit<UseSearchFilterOptions<T>, 'items'> {
  items: T[];
  itemsPerPage?: number;
}

export interface UseDataTableReturn<T> {
  // Search & Filter
  search: string;
  filters: Record<string, string>;
  filteredItems: T[];
  setSearch: (search: string) => void;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
  resetAll: () => void;

  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  goToFirstPage: () => void;

  // Paginated data
  paginatedItems: T[];
  hasPagination: boolean;
}

export function useDataTable<T>({
  items,
  searchKeys,
  initialFilters = {},
  initialPage = 1,
  itemsPerPage = 15,
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const pagination = usePagination({ initialPage, itemsPerPage });
  const searchFilter = useSearchFilter({ items, searchKeys, initialFilters });

  // Calculate paginated items
  const paginatedItems = useMemo(() => {
    const start = pagination.startIndex;
    const end = pagination.endIndex;
    return searchFilter.filteredItems.slice(start, end);
  }, [searchFilter.filteredItems, pagination.startIndex, pagination.endIndex]);

  // Update total items when filtered items change
  const totalItems = searchFilter.filteredItems.length;

  // Reset to first page when search/filter changes
  const setSearch = useCallback((search: string) => {
    searchFilter.setSearch(search);
    pagination.goToFirstPage();
  }, [searchFilter, pagination]);

  const setFilter = useCallback((key: string, value: string) => {
    searchFilter.setFilter(key, value);
    pagination.goToFirstPage();
  }, [searchFilter, pagination]);

  const resetFilters = useCallback(() => {
    searchFilter.resetFilters();
    pagination.goToFirstPage();
  }, [searchFilter, pagination]);

  const resetAll = useCallback(() => {
    searchFilter.resetAll();
    pagination.goToFirstPage();
  }, [searchFilter, pagination]);

  const hasPagination = totalItems > itemsPerPage;

  return {
    // Search & Filter
    search: searchFilter.search,
    filters: searchFilter.filters,
    filteredItems: searchFilter.filteredItems,
    setSearch: searchFilter.setSearch,
    setFilter: searchFilter.setFilter,
    resetFilters: searchFilter.resetFilters,
    resetAll: searchFilter.resetAll,

    // Pagination
    currentPage: pagination.currentPage,
    itemsPerPage: pagination.itemsPerPage,
    totalItems,
    totalPages: pagination.totalPages,
    startIndex: pagination.startIndex,
    endIndex: pagination.endIndex,
    setPage: pagination.setPage,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    canGoNext: pagination.canGoNext,
    canGoPrev: pagination.canGoPrev,
    goToFirstPage: pagination.goToFirstPage,

    // Paginated data
    paginatedItems,
    hasPagination,
  };
}
