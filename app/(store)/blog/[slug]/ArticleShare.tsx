'use client';

import { useState } from 'react';
import { Check, MessageCircle, Link as LinkIcon } from 'lucide-react';

interface ArticleShareProps {
  title: string;
  url?: string;
}

export default function ArticleShare({ title, url }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return url || '';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleWhatsAppShare = () => {
    const currentUrl = getShareUrl();
    const text = encodeURIComponent(`${title} - ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-[#78716c]">Bagikan:</span>

      <button
        onClick={handleWhatsAppShare}
        className="text-[#1c1917] hover:text-[#00AA5B] font-semibold transition-colors inline-flex items-center gap-1"
        aria-label="Bagikan melalui WhatsApp"
      >
        <MessageCircle size={13} />
        <span>WhatsApp</span>
      </button>

      <button
        onClick={handleCopy}
        className="text-[#1c1917] hover:text-[#00AA5B] font-semibold transition-colors inline-flex items-center gap-1"
        aria-label="Salin tautan artikel"
      >
        {copied ? (
          <>
            <Check size={13} className="text-[#00AA5B]" />
            <span className="text-[#00AA5B]">Tersalin</span>
          </>
        ) : (
          <>
            <LinkIcon size={13} />
            <span>Salin Tautan</span>
          </>
        )}
      </button>
    </div>
  );
}
