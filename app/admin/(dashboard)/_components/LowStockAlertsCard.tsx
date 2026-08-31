'use client';

import React from 'react';
import Link from 'next/link';
import { Package, AlertTriangle } from 'lucide-react';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

export interface LowStockProductItem {
  id: string;
  title: string;
  quantity: number;
  maxQuantity?: number;
  imageUrl?: string;
}

interface LowStockAlertsCardProps {
  products: LowStockProductItem[];
}

export default function LowStockAlertsCard({ products }: LowStockAlertsCardProps) {
  const { t, locale } = useAdminLanguage();
  const items: LowStockProductItem[] =
    products && products.length > 0
      ? products
      : [
          {
            id: '1',
            title: 'Kapsul Ambiro Herbal',
            quantity: 3,
            maxQuantity: 20,
          },
          {
            id: '2',
            title: 'Ekstrak Daun Katuk',
            quantity: 4,
            maxQuantity: 20,
          },
          {
            id: '3',
            title: 'Madu Habbatussauda Premium',
            quantity: 8,
            maxQuantity: 50,
          },
          {
            id: '4',
            title: 'Minyak Zaitun Al-Kautsar',
            quantity: 12,
            maxQuantity: 50,
          },
        ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">{t('lowStockTitle')}</h3>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <Link
            href="/admin/products?filterStock=LOW"
            className="text-xs font-semibold text-primary-green hover:underline"
          >
            {t('viewAll')}
          </Link>
        </div>

        <div className="space-y-4">
          {items.slice(0, 5).map((item) => {
            const isCritical = item.quantity <= 3;
            const isWarning = item.quantity > 3 && item.quantity <= 10;
            const max = item.maxQuantity || 20;
            const percentage = Math.min(Math.max((item.quantity / max) * 100, 10), 100);

            let barColor = 'bg-emerald-500';
            let badgeColor = 'text-gray-500';
            let label = `Stok: ${item.quantity}`;

            if (isCritical) {
              barColor = 'bg-red-500';
              badgeColor = 'text-red-600 font-bold';
              label = `Sisa ${item.quantity}`;
            } else if (isWarning) {
              barColor = 'bg-amber-500';
              badgeColor = 'text-amber-600 font-bold';
              label = `Sisa ${item.quantity}`;
            }

            return (
              <div key={item.id} className="group">
                <div className="flex items-center gap-3">
                  {/* Thumbnail Image */}
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package size={18} className="text-gray-400" />
                    )}
                  </div>

                  {/* Info + Progress Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {item.title}
                      </p>
                      <span className={`text-[11px] tabular-nums shrink-0 ${badgeColor}`}>
                        {label}
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
