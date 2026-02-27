import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

// Routes requiring a logged-in user (any role)
const USER_PROTECTED = ['/profile', '/checkout', '/orders'];

// Routes requiring admin role
const ADMIN_PROTECTED = ['/admin'];

/**
 * Verifies a HS256 JWT using the Web Crypto API.
 * This is edge-runtime compatible — no Node.js modules.
 */
async function verifyJWT(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    // Base64url → Base64 → Uint8Array
    const b64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const signature = Uint8Array.from(binary, (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!valid) return null;

    const payloadJson = atob(
      payloadB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(
        payloadB64.length + ((4 - (payloadB64.length % 4)) % 4),
        '=',
      ),
    );
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresUser = USER_PROTECTED.some((r) => pathname.startsWith(r));
  const requiresAdmin = ADMIN_PROTECTED.some((r) => pathname.startsWith(r));

  if (!requiresUser && !requiresAdmin) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const secret = process.env.JWT_SECRET ?? '';
  const payload = await verifyJWT(token, secret);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  if (requiresAdmin && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*', '/orders/:path*', '/admin/:path*'],
};
