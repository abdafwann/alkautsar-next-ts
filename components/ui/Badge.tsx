import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'sale';
  size?: 'sm' | 'md';
}

/* 
 * Menstandarisasi palet visual status dan tag promosi agar konsisten dengan token 
 * Tailwind v4 dan lolos uji kontras minimum WCAG AA (4.5:1 untuk teks kecil)
 */
const variants = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  danger: 'bg-red-50 text-red-700 border border-red-200/60',
  info: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  default: 'bg-gray-100 text-gray-700 border border-gray-200/60',
  sale: 'bg-red-600 text-white shadow-2xs font-bold border-transparent',
};

/*
 * Skala padding proporsional agar badge dapat disematkan baik pada container 
 * micro-card produk ('sm') maupun label status transaksi ('md')
 */
const sizes = {
  sm: 'px-2 py-0.5 text-[10px] tracking-tight',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({
  children,
  variant = 'success',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
