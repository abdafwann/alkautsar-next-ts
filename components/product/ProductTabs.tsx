'use client';

import { useState } from 'react';

interface ProductTabsProps {
  composition: string | null;
  directions: string;
  warnings: string | null;
}

export default function ProductTabs({ composition, directions, warnings }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'composition' | 'directions' | 'warnings'>('directions');

  const tabs = [
    { id: 'directions', label: 'Aturan Pakai', content: directions },
    { id: 'composition', label: 'Komposisi', content: composition },
    { id: 'warnings', label: 'Peringatan', content: warnings },
  ].filter(t => t.content && t.content.trim() !== ''); // Hanya tampilkan tab yang ada isinya

  if (tabs.length === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-4 font-bold text-sm whitespace-nowrap transition-colors relative ${
              activeTab === tab.id 
                ? 'text-primary-green' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-green"></div>
            )}
          </button>
        ))}
      </div>

      {/* Konten Tab */}
      <div className="p-8 prose prose-sm max-w-none prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-primary-green">
        <div className="whitespace-pre-wrap leading-relaxed">
          {tabs.find(t => t.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}
