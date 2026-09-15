import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// ─── Fix #5: Rate Limiting with Cleanup ──────────────
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_STORE_SIZE = 10000; // Cap the map to prevent memory leaks

// Periodic cleanup of expired entries
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (val.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 60 seconds
if (typeof globalThis !== 'undefined') {
  // Avoid setting multiple intervals in dev mode (hot reload)
  const globalObj = globalThis as any;
  if (!globalObj.__rateLimitCleanup) {
    globalObj.__rateLimitCleanup = setInterval(cleanupRateLimitStore, 60_000);
  }
}

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup'];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ─── Fix #4: CSRF Protection for API routes ───────
  if (path.startsWith('/api') && request.method === 'POST') {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const appOrigin = new URL(APP_URL).origin;

    // Allow requests with no origin header (same-origin browser requests, curl, etc.)
    // But block requests from a different origin (cross-site attack)
    if (origin && origin !== appOrigin) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Cross-origin request blocked' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Also check referer as a secondary defense
    if (!origin && referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (refererOrigin !== appOrigin) {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch {
        // Malformed referer — allow through (could be a non-browser client)
      }
    }
  }

  // Rate Limiting for /api routes
  if (path.startsWith('/api')) {
    const ip = request.headers.get('x-real-ip') || 
               request.headers.get('x-forwarded-for') || 
               'anonymous';

    const now = Date.now();
    let record = rateLimitStore.get(ip);

    if (!record || record.resetTime < now) {
      record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
      // Safety: don't let the map grow unbounded
      if (rateLimitStore.size >= MAX_STORE_SIZE) {
        cleanupRateLimitStore();
      }
      rateLimitStore.set(ip, record);
    } else {
      record.count++;
      if (record.count > MAX_REQUESTS_PER_WINDOW) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
            } 
          }
        );
      }
    }
  }

  // Allow public routes
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith('/_next') || path.startsWith('/api/auth')
  );

  if (isPublicRoute) {
    const res = NextResponse.next();
    applySecurityHeaders(res);
    return res;
  }

  // Check for session cookie
  const session = request.cookies.get('session')?.value;

  if (!session) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    applySecurityHeaders(res);
    return res;
  }

  // Verify the JWT
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });

    // Check expiry
    const expiresAt = new Date(payload.expiresAt as string);
    if (expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Session is valid — refresh the cookie expiry (sliding window)
    const response = NextResponse.next();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    response.cookies.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: newExpiry,
      sameSite: 'lax',
      path: '/',
    });

    applySecurityHeaders(response);
    return response;
  } catch {
    // Invalid token — redirect to login
    const res = NextResponse.redirect(new URL('/login', request.url));
    applySecurityHeaders(res);
    return res;
  }
}

function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-DNS-Prefetch-Control', 'on');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Fix #9: Content-Security-Policy
  res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Required for Next.js
    "style-src 'self' 'unsafe-inline'",                  // Required for Tailwind
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
