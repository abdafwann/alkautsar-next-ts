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
      <div className="pb-5 border-b border-[#ede8de]">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-1">
          Informasi Pribadi
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight">
          Profil Saya
        </h2>
        <p className="text-xs text-text-main/70 mt-1 leading-relaxed">
          Kelola data diri, kontak, dan alamat utama pengiriman obat herbal keluarga Anda.
        </p>
      </div>

      <ProfileFormClient initialData={profile.data} />
    </div>
  );
}
