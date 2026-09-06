import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionPayload } from '@/lib/definitions';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Sign a JWT with HS256 — contains userId, name, email, expiry.
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

/**
 * Verify and decode a JWT — returns the payload or undefined on failure.
 */
export async function decrypt(
  session: string | undefined = ''
): Promise<SessionPayload | undefined> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return undefined;
  }
}

/**
 * Create a new session — signs a JWT and stores it in an HTTP-only cookie.
 */
export async function createSession(
  userId: string,
  name: string,
  email: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, name, email, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Get the current session from cookies — returns the decoded payload or null.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  const payload = await decrypt(session);
  if (!payload) return null;

  // Check expiry
  if (new Date(payload.expiresAt) < new Date()) {
    return null;
  }

  return payload;
}

/**
 * Refresh the session expiry — extends the cookie for another 7 days.
 */
export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Delete the session cookie — effectively logs the user out.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
