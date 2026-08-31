import { SignJWT, jwtVerify } from 'jose';
import { encodedKey } from './session';

export interface OrderClaimPayload {
  orderId: string;
  email: string;
}

/**
 * Creates a cryptographically signed token proving ownership of an order during checkout session
 */
export async function createOrderClaimToken(orderId: string, email: string): Promise<string> {
  return new SignJWT({ orderId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('48h')
    .sign(encodedKey);
}

/**
 * Verifies if an order claim token matches the requested order
 */
export async function verifyOrderClaimToken(token?: string | null, expectedOrderId?: string | null): Promise<OrderClaimPayload | null> {
  if (!token || !expectedOrderId) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    const claim = payload as unknown as OrderClaimPayload;
    if (claim.orderId === expectedOrderId) {
      return claim;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * PII Masking Utilities for Public / Unverified Views
 */
export function maskEmail(email?: string | null): string {
  if (!email) return '-';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [user, domain] = parts;
  if (user.length <= 2) {
    return `${user[0] || ''}***@${domain}`;
  }
  return `${user.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 7) return '***';
  return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
}

export function maskName(name?: string | null): string {
  if (!name) return '-';
  const trimmed = name.trim();
  if (trimmed.length <= 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}***${trimmed[trimmed.length - 1]}`;
}

export function maskAddress(address?: string | null): string {
  if (!address) return '-';
  const trimmed = address.trim();
  if (trimmed.length <= 8) return '********';
  return `${trimmed.slice(0, 8)}********`;
}
