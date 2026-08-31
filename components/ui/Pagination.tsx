'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  itemLabel = 'item',
}: PaginationProps) {
  if (totalItems === 0) return null;

  return (
    <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-white">
      <p className="text-sm text-gray-500 font-medium">
        Menampilkan <span className="font-bold text-gray-900">{startIndex + 1}</span> -{' '}
        <span className="font-bold text-gray-900">{endIndex}</span> dari{' '}
        <span className="font-bold text-gray-900">{totalItems}</span> {itemLabel}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
