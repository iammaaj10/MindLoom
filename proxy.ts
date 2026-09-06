import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup'];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public routes
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith('/_next') || path.startsWith('/api/auth')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
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

    return response;
  } catch {
    // Invalid token — redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
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
