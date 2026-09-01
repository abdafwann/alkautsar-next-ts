'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { recordAdminLog } from './admin-logs';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is required');
}

const key = new TextEncoder().encode(secretKey);

/**
 * Helper: Verifikasi apakah session aktif memiliki role SUPERADMIN
 */
async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  if (!token) return { isAuthorized: false, currentAdminId: null };

  try {
    const verified = await jwtVerify(token, key);
    const payload = verified.payload as any;
    
    // Periksa DB untuk memastikan role
    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId }
    });

    if (!admin || admin.role !== 'SUPERADMIN') {
      return { isAuthorized: false, currentAdminId: null };
    }

    return { isAuthorized: true, currentAdminId: admin.id };
  } catch (error) {
    return { isAuthorized: false, currentAdminId: null };
  }
}

export async function getAdmins() {
  const { isAuthorized } = await verifySuperAdmin();
  if (!isAuthorized) {
    return { success: false, error: 'Akses Ditolak: Anda bukan SuperAdmin' };
  }

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: admins };
  } catch (error) {
    return { success: false, error: 'Gagal memuat data admin' };
  }
}

export async function createAdmin(formData: FormData) {
  const { isAuthorized, currentAdminId } = await verifySuperAdmin();
  if (!isAuthorized) {
    return { success: false, error: 'Akses Ditolak: Hanya SuperAdmin yang bisa membuat admin baru' };
  }

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'SUPERADMIN' | 'ADMIN';
    const masterKey = formData.get('master_key') as string;

    if (!name || !email || !password || !role || !masterKey) {
      return { success: false, error: 'Semua field harus diisi termasuk Kode Keamanan' };
    }

    // Layer 1.5: Master Security Code (Sudo Mode)
    // Membaca dari environment variable, fallback ke string jika env belum terload
    const VALID_MASTER_KEY = process.env.MASTER_SECURITY_CODE;

    if (!VALID_MASTER_KEY) {
      return { success: false, error: 'Kode Keamanan belum dikonfigurasi di server' };
    }

    if (masterKey !== VALID_MASTER_KEY) {
      return { success: false, error: 'Kode Keamanan Salah! Akses Ditolak.' };
    }

    // Layer 2: Password Strength Regex (Min 8 char, 1 uppercase, 1 number, 1 symbol)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return { 
        success: false, 
        error: 'Password terlalu lemah! Harus minimal 8 karakter, mengandung huruf besar, angka, dan simbol khusus.' 
      };
    }

    // Check existing email
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return { success: false, error: 'Email ini sudah terdaftar sebagai Admin' };
    }

    // Layer 3: Deep Hashing (Cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (currentAdminId) {
      await recordAdminLog({
        adminId: currentAdminId,
        action: 'CREATE_ADMIN',
        entity: 'admin',
        entityId: newAdmin.id,
        details: `Membuat admin baru: ${newAdmin.name} (${newAdmin.email}) dengan role ${newAdmin.role}`
      });
    }

    return { success: true, data: newAdmin };
  } catch (error) {
    console.error('Create Admin Error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem saat membuat admin' };
  }
}

export async function deleteAdmin(adminId: string) {
  const { isAuthorized, currentAdminId } = await verifySuperAdmin();
  if (!isAuthorized) {
    return { success: false, error: 'Akses Ditolak: Anda bukan SuperAdmin' };
  }

  if (adminId === currentAdminId) {
    return { success: false, error: 'Anda tidak bisa menghapus akun Anda sendiri' };
  }

  try {
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { name: true, email: true }
    });

    await prisma.admin.delete({
      where: { id: adminId }
    });

    if (currentAdminId) {
      await recordAdminLog({
        adminId: currentAdminId,
        action: 'DELETE_ADMIN',
        entity: 'admin',
        entityId: adminId,
        details: `Menghapus akun admin: ${targetAdmin?.name || adminId} (${targetAdmin?.email || '-'})`
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus admin' };
  }
}
