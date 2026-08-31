import { getActiveBanner } from '@/app/actions/store-frontend';
import HomeHeroClient from './HomeHeroClient';

export default async function HomeHero() {
  const response = await getActiveBanner();
  const bannerUrl = response.success && response.data?.bannerUrl 
    ? response.data.bannerUrl 
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200'; // Fallback to a better quality unpslash
    
  const storeName = response.success && response.data?.storeName ? response.data.storeName : 'Premium Herbal';

  return <HomeHeroClient storeName={storeName} bannerUrl={bannerUrl} />;
}
