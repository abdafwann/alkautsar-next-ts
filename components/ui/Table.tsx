import React from 'react';

export function Table({ children, className = '', tableClassName = '' }: { children: React.ReactNode, className?: string, tableClassName?: string }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white ${className}`}>
      <table className={`w-full text-left text-sm text-gray-600 ${tableClassName}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={`px-6 py-4 tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-gray-50">
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={`hover:bg-gray-50/50 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}
