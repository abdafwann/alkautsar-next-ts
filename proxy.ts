import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'development-fallback-secret-key-32-chars-long';
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes against unauthenticated access
  if (pathname.startsWith('/admin')) {
    // Whitelist login route
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, getJwtSecret());
      return NextResponse.next();
    } catch (_err) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
