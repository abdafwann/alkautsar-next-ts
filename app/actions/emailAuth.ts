'use server';

import { prisma } from '@/lib/prisma';
import { getSession, createSession } from '@/lib/session';
import { sendEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

// In-memory failed attempt tracker per user to defend against brute-force attacks within the 10m window
const MAX_OTP_ATTEMPTS = 5;
const failedAttemptsMap = new Map<string, number>();

// In-memory cooldown tracker to prevent flooding email provider (Resend / SMTP)
const requestCooldownMap = new Map<string, number>();
const MIN_REQUEST_INTERVAL_MS = 60 * 1000; // 1 minute between OTP requests

// Generate secure 6-digit numeric OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function requestEmailChange(newEmail: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' };

    const email = newEmail.toLowerCase().trim();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Format alamat email tidak valid.' };
    }

    // Rate-limit consecutive requests to prevent SMTP abuse and quota draining
    const lastRequest = requestCooldownMap.get(session.userId);
    const now = Date.now();
    if (lastRequest && now - lastRequest < MIN_REQUEST_INTERVAL_MS) {
      const waitSeconds = Math.ceil((MIN_REQUEST_INTERVAL_MS - (now - lastRequest)) / 1000);
      return {
        success: false,
        error: `Harap tunggu ${waitSeconds} detik sebelum meminta kode OTP baru.`
      };
    }

    // Check if new email is already registered to another account
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: 'Email ini sudah terdaftar di akun lain.' };
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Reset failed attempts counter for the new OTP cycle
    failedAttemptsMap.delete(session.userId);
    requestCooldownMap.set(session.userId, now);

    // Save pending change and OTP hash/value
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        pendingEmail: email,
        emailOtp: otp,
        emailOtpExpires: expires,
      }
    });

    // Send OTP verification email
    const { success, error } = await sendEmail({
      to: email,
      subject: 'Kode Verifikasi Ganti Email - Alkautsar Herbal',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
          <h2 style="color: #059669; margin-bottom: 16px;">Kode Verifikasi Perubahan Email</h2>
          <p>Kami menerima permintaan untuk mengubah alamat email akun Alkautsar Herbal Anda ke email ini.</p>
          <p>Gunakan kode OTP berikut untuk mengonfirmasi perubahan:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Kode ini hanya berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
          <p style="font-size: 14px; color: #6b7280;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
        </div>
      `
    });

    if (!success) {
      console.error('Email Delivery Failed:', error);
      return { success: false, error: 'Gagal mengirim email OTP. Silakan coba beberapa saat lagi.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Request Email Change Error:', error);
    return { success: false, error: 'Terjadi kesalahan saat mengirim OTP.' };
  }
}

export async function verifyEmailChange(otp: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' };

    const cleanOtp = otp.trim();
    const attempts = failedAttemptsMap.get(session.userId) || 0;

    // Enforce hard lockout after max failed attempts to prevent online brute-forcing
    if (attempts >= MAX_OTP_ATTEMPTS) {
      // Invalidate the current OTP cycle immediately
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          pendingEmail: null,
          emailOtp: null,
          emailOtpExpires: null,
        }
      });
      failedAttemptsMap.delete(session.userId);

      return {
        success: false,
        error: 'Terlalu banyak percobaan salah. Kode OTP telah dibatalkan demi keamanan. Silakan minta kode baru.'
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user || !user.pendingEmail || !user.emailOtp || !user.emailOtpExpires) {
      return { success: false, error: 'Tidak ada permintaan ganti email yang aktif.' };
    }

    if (new Date() > user.emailOtpExpires) {
      return { success: false, error: 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.' };
    }

    if (user.emailOtp !== cleanOtp) {
      const nextAttempts = attempts + 1;
      failedAttemptsMap.set(session.userId, nextAttempts);
      const remaining = MAX_OTP_ATTEMPTS - nextAttempts;

      if (remaining <= 0) {
        await prisma.user.update({
          where: { id: session.userId },
          data: {
            pendingEmail: null,
            emailOtp: null,
            emailOtpExpires: null,
          }
        });
        failedAttemptsMap.delete(session.userId);
        return {
          success: false,
          error: 'Kode OTP salah. Batas maksimal percobaan tercapai. Kode telah dibatalkan.'
        };
      }

      return {
        success: false,
        error: `Kode OTP salah. Sisa ${remaining} kesempatan sebelum kode dibatalkan.`
      };
    }

    // Clear failed attempts on successful verification
    failedAttemptsMap.delete(session.userId);

    const newEmail = user.pendingEmail;

    // Race condition check: Ensure target email was not taken while OTP was pending
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      return { success: false, error: 'Email ini sudah digunakan oleh akun lain.' };
    }

    // Atomically commit new email and clear OTP state
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        email: newEmail,
        pendingEmail: null,
        emailOtp: null,
        emailOtpExpires: null,
      }
    });

    // Re-issue authenticated session cookie with new email claim
    await createSession(session.userId, session.name, newEmail);

    revalidatePath('/account');
    return { success: true, newEmail };
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    return { success: false, error: 'Terjadi kesalahan saat verifikasi OTP.' };
  }
}
