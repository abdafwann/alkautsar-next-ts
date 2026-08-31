'use client';

import Link from 'next/link';
import { StoreInfo } from './types';

interface AnnouncementBannerProps {
  storeInfo: StoreInfo;
}

/**
 * Announcement Banner Component
 * Displays top announcement bar with optional link
 */
export function AnnouncementBanner({ storeInfo }: AnnouncementBannerProps) {
  const { announcementActive, announcementText, announcementLink } = storeInfo;

  if (!announcementActive || !announcementText) {
    return null;
  }

  return (
    <div className="bg-primary-green text-white text-xs md:text-sm font-medium py-2 px-4 text-center relative z-[60]">
      {announcementLink ? (
        <Link href={announcementLink} className="hover:underline">
          {announcementText}
        </Link>
      ) : (
        <span>{announcementText}</span>
      )}
    </div>
  );
}
