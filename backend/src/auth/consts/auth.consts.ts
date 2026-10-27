export const BCRYPT_ROUNDS = 12;

/**
 * A rotated refresh token presented again within this window is treated as
 * a concurrent refresh (proxy + browser at the same time), not as theft.
 */
export const REFRESH_REUSE_GRACE_MS = 30_000;

/** Slugs that would collide with top-level frontend routes. */
export const RESERVED_SLUGS = new Set([
  'login',
  'register',
  'register-organization',
  'forgot-password',
  'reset-password',
  'no-org-access',
  'api',
  'auth',
  'admin',
  'agent',
  'customer',
]);
