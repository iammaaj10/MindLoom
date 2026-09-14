import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Basic in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 API calls per minute per IP

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup'];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate Limiting for /api routes
  if (path.startsWith('/api')) {
    const ip = request.headers.get('x-real-ip') || 
               request.headers.get('x-forwarded-for') || 
               'anonymous';

    const now = Date.now();
    let record = rateLimitStore.get(ip);

    if (!record || record.resetTime < now) {
      record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
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
