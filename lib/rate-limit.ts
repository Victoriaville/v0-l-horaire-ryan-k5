/**
 * Rate Limiting System for Login Protection
 * Prevents brute force attacks by limiting login attempts per IP
 * 
 * Rules:
 * - Max 5 failed attempts per IP
 * - After 5 failures: lock for 15 minutes
 * - Successful login resets the counter
 * - Counter auto-resets after 15 minutes of last failure
 */

interface RateLimitEntry {
  failedAttempts: number;
  lastFailedAt: number;
  isLocked: boolean;
  lockedUntil: number;
}

// In-memory store: IP → RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESET_DURATION_MS = 15 * 60 * 1000; // 15 minutes of inactivity

/**
 * Extract IP from request headers
 * Works with proxies (Vercel, etc.)
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback for local development
  return '127.0.0.1';
}

/**
 * Check if IP is currently locked out
 * Returns: { isLocked: boolean, reason?: string }
 */
export function isRateLimited(ip: string): { isLocked: boolean; reason?: string } {
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    return { isLocked: false };
  }

  const now = Date.now();

  // Check if lockout period has expired
  if (entry.isLocked && now >= entry.lockedUntil) {
    // Lockout expired, reset
    rateLimitStore.delete(ip);
    return { isLocked: false };
  }

  // Check if counter should reset due to inactivity
  if (!entry.isLocked && now - entry.lastFailedAt >= RESET_DURATION_MS) {
    rateLimitStore.delete(ip);
    return { isLocked: false };
  }

  if (entry.isLocked) {
    return {
      isLocked: true,
      reason: 'lockout',
    };
  }

  return { isLocked: false };
}

/**
 * Record a failed login attempt
 * Increments counter and locks if threshold reached
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || {
    failedAttempts: 0,
    lastFailedAt: now,
    isLocked: false,
    lockedUntil: 0,
  };

  entry.failedAttempts += 1;
  entry.lastFailedAt = now;

  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.isLocked = true;
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  rateLimitStore.set(ip, entry);
}

/**
 * Reset rate limit for an IP (successful login)
 */
export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Get current rate limit state for debugging (admin only)
 */
export function getRateLimitState(ip: string): RateLimitEntry | null {
  return rateLimitStore.get(ip) || null;
}

/**
 * Clear all rate limits (use sparingly, e.g., after admin unlock)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
