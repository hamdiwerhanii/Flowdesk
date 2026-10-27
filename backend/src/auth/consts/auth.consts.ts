export const BCRYPT_ROUNDS = 12;

export const REFRESH_REUSE_GRACE_MS = 30_000;

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
