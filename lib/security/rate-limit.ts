/**
 * Simple in-memory sliding-window rate limiter.
 * No external dependencies required.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => now - t < 60_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

/**
 * Check if a request should be rate-limited.
 * @param identifier - Unique key (e.g. userId)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds (default 60s)
 * @returns { allowed: boolean, remaining: number, resetMs: number }
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let entry = store.get(identifier);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(identifier, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetMs = windowMs - (now - oldestInWindow);
    return { allowed: false, remaining: 0, resetMs };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: 0,
  };
}
