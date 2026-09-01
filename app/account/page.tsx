import { getProfile } from '@/app/actions/account';
import { ProfileFormClient } from './ProfileFormClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const profile = await getProfile();
  
  if (!profile.success || !profile.data) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profil Saya</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi data diri dan kontak Anda di sini.</p>
      </div>

      <div className="h-px w-full bg-zinc-100" />

      <ProfileFormClient initialData={profile.data} />
    </div>
  );
}
