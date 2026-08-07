import { getStoreSettings } from '@/app/actions/settings';
import { getBanners } from '@/app/actions/banner';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Pengaturan Toko - Admin PT. Al-Kautsar',
};

export default async function SettingsPage() {
  const [settingsRes, bannersRes] = await Promise.all([
    getStoreSettings(),
    getBanners()
  ]);

  const settings = settingsRes.success ? settingsRes.data : null;
  const banners = bannersRes.success ? bannersRes.data : [];

  return <SettingsClient initialSettings={settings} initialBanners={banners} />;
}
