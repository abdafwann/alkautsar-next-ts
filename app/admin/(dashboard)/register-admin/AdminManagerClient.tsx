'use client';

import { useState, useEffect } from 'react';
import { getAdmins, createAdmin, deleteAdmin } from '@/app/actions/admin-management';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Trash2, UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminLanguage } from '@/lib/i18n/AdminLanguageContext';

export default function AdminManagerClient() {
  const { t, locale } = useAdminLanguage();
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'SUPERADMIN' | 'ADMIN',
    master_key: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  const fetchAdmins = async () => {
    setIsLoading(true);
    const res = await getAdmins();
    if (res.success) {
      setAdmins(res.data || []);
    } else {
      toast.error(res.error || (locale === 'EN' ? 'Failed to load admins' : 'Gagal memuat admin'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]/.test(pass)) score++;

    if (score === 0) setPasswordStrength({ score, text: locale === 'EN' ? 'Very Weak' : 'Sangat Lemah', color: 'bg-red-500' });
    else if (score <= 2) setPasswordStrength({ score, text: locale === 'EN' ? 'Weak' : 'Lemah', color: 'bg-orange-500' });
    else if (score === 3) setPasswordStrength({ score, text: locale === 'EN' ? 'Medium' : 'Sedang', color: 'bg-yellow-500' });
    else setPasswordStrength({ score, text: locale === 'EN' ? 'Strong' : 'Kuat', color: 'bg-green-500' });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });
    checkPasswordStrength(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordStrength.score < 4) {
      toast.error(locale === 'EN' ? 'Password does not meet security standards!' : 'Password belum memenuhi standar keamanan!');
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('role', formData.role);
    form.append('master_key', formData.master_key);

    const res = await createAdmin(form);
    if (res.success) {
      toast.success(locale === 'EN' ? 'Admin added successfully' : 'Admin berhasil ditambahkan');
      setFormData({ name: '', email: '', password: '', role: 'ADMIN', master_key: '' });
      setPasswordStrength({ score: 0, text: '', color: '' });
      setIsModalOpen(false);
      fetchAdmins();
    } else {
      toast.error(res.error || (locale === 'EN' ? 'Failed to create admin' : 'Gagal membuat admin'));
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(locale === 'EN' ? 'Are you sure you want to remove this admin account?' : 'Apakah Anda yakin ingin menghapus akses admin ini?')) return;
    
    const res = await deleteAdmin(id);
    if (res.success) {
      toast.success(locale === 'EN' ? 'Admin removed successfully' : 'Admin berhasil dihapus');
      fetchAdmins();
    } else {
      toast.error(res.error || (locale === 'EN' ? 'Failed to delete admin' : 'Gagal menghapus admin'));
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{t('staffList')}</h2>
          <Button onClick={() => setIsModalOpen(true)} leftIcon={<UserPlus size={18} />}>
            {t('addAdmin')}
          </Button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500">{t('loading')}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead className="text-right">{t('action')}</TableHead>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-semibold">{admin.name}</TableCell>
                  <TableCell className="text-gray-500">{admin.email}</TableCell>
                  <TableCell>
                    {admin.role === 'SUPERADMIN' ? (
                      <Badge variant="warning" className="flex w-fit items-center gap-1">
                        <ShieldAlert size={12} /> SuperAdmin
                      </Badge>
                    ) : (
                      <Badge variant="info" className="flex w-fit items-center gap-1">
                        <ShieldCheck size={12} /> Admin
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={admin.role === 'SUPERADMIN'}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addAdmin')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label={locale === 'EN' ? 'Full Name' : 'Nama Lengkap'} 
            placeholder="John Doe" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required 
          />
          <Input 
            label={t('email')} 
            type="email" 
            placeholder="admin@toko.com" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required 
          />
          
          <div className="space-y-1">
            <Input 
              label={locale === 'EN' ? 'Password (High Security)' : 'Password (High Security)'} 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handlePasswordChange}
              required 
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(num => (
                    <div 
                      key={num} 
                      className={`h-1.5 flex-1 rounded-full ${passwordStrength.score >= num ? passwordStrength.color : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.score < 4 ? 'text-red-500' : 'text-green-600'}`}>
                  {passwordStrength.score < 4 ? (locale === 'EN' ? 'Required: Min. 8 chars, 1 uppercase, 1 number, 1 special char' : 'Wajib: Min. 8 Karakter, 1 Huruf Besar, 1 Angka, 1 Simbol') : (locale === 'EN' ? 'Password meets security requirements.' : 'Password memenuhi standar keamanan.')}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('role')}</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`border p-3 rounded-xl cursor-pointer ${formData.role === 'SUPERADMIN' ? 'border-primary-green bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setFormData({...formData, role: 'SUPERADMIN'})}
              >
                <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                  <ShieldAlert size={16} className={formData.role === 'SUPERADMIN' ? 'text-primary-green' : 'text-gray-400'} />
                  SuperAdmin
                </div>
                <p className="text-xs text-gray-500">{locale === 'EN' ? 'Full access, can create other admins.' : 'Akses penuh, bisa membuat admin lain.'}</p>
              </div>
              <div 
                className={`border p-3 rounded-xl cursor-pointer ${formData.role === 'ADMIN' ? 'border-primary-green bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setFormData({...formData, role: 'ADMIN'})}
              >
                <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                  <ShieldCheck size={16} className={formData.role === 'ADMIN' ? 'text-primary-green' : 'text-gray-400'} />
                  Admin
                </div>
                <p className="text-xs text-gray-500">{locale === 'EN' ? 'Manage orders and products only.' : 'Hanya kelola pesanan & produk.'}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Input 
              label={locale === 'EN' ? 'SuperAdmin Security Key' : 'Kode Keamanan SuperAdmin'} 
              type="password" 
              placeholder={locale === 'EN' ? 'Enter master secret key...' : 'Masukkan kode master rahasia...'} 
              value={formData.master_key}
              onChange={e => setFormData({...formData, master_key: e.target.value})}
              required 
            />
            <p className="text-xs text-gray-500 mt-1">
              {locale === 'EN' ? 'As an extra security layer, creating staff admins requires the master PIN.' : 'Sebagai lapis keamanan ekstra, pembuatan admin memerlukan PIN/Kode rahasia pemilik.'}
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={isSubmitting} disabled={passwordStrength.score < 4}>{t('save')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
