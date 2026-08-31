'use client';

import Link from 'next/link';
import { Edit2, Trash2, Tag, PackagePlus, Zap, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types/admin';

interface ProductTableRowProps {
  product: Product;
  onStockClick: (product: Product) => void;
  onPromoClick: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
}

export function ProductTableRow({
  product,
  onStockClick,
  onPromoClick,
  onDeleteClick,
}: ProductTableRowProps) {
  const image = product.images?.[0]?.url || 'https://via.placeholder.com/80';
  const formattedPrice = formatCurrency(product.price);
  const formattedPromoPrice = product.isPromo && product.promoPrice
    ? formatCurrency(product.promoPrice)
    : null;

  const stockStatusClass = product.quantity > 10
    ? 'bg-green-100 text-green-700'
    : product.quantity > 5
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700 shadow-[0_0_10px_rgba(239,68,68,0.4)] border border-red-300';

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      {/* Product */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
            <img src={image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{product.title}</p>
            {product.isFeatured && (
              <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                Unggulan
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md">
            <Tag size={12} />
            {product.category?.name || '-'}
          </span>
          {product.isPromo && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-[0_2px_10px_-3px_rgba(225,29,72,0.5)] border border-red-400/50">
              <Zap size={10} className="fill-white animate-pulse" />
              Promo
            </span>
          )}
        </div>
      </td>

      {/* Form */}
      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap font-medium">
        {product.productForm || '-'}
      </td>

      {/* Price */}
      <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
        {formattedPromoPrice ? (
          <div className="flex flex-col">
            <span className="text-red-600">{formattedPromoPrice}</span>
            <span className="text-xs text-gray-400 line-through font-normal">{formattedPrice}</span>
          </div>
        ) : (
          formattedPrice
        )}
      </td>

      {/* Stock */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${stockStatusClass}`}>
            {product.quantity <= 5 && <AlertTriangle size={12} className="mr-1 animate-pulse" />}
            {product.quantity} tersisa
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onStockClick(product)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Tambah Stok (Masuk Gudang)"
          >
            <PackagePlus size={16} />
          </button>
          <button
            onClick={() => onPromoClick(product)}
            className={`p-2 rounded-lg transition-colors ${
              product.isPromo
                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
            }`}
            title="Atur Flash Sale / Promo"
          >
            <Tag size={16} />
          </button>
          <Link href={`/admin/products/form?id=${product.id}`}>
            <button
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Data Lengkap"
            >
              <Edit2 size={16} />
            </button>
          </Link>
          <button
            onClick={() => onDeleteClick(product)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus Produk"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
