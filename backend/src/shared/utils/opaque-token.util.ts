import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Opaque tokens are `<recordId>.<secret>` (refresh tokens, password links).
 * The record id makes lookup a primary-key read; only the SHA-256 of the
 * secret is stored, so a database leak does not leak usable tokens.
 */
export const generateSecret = (): string =>
  randomBytes(48).toString('base64url');

export const hashSecret = (secret: string): string =>
  createHash('sha256').update(secret).digest('hex');

export const formatToken = (id: string, secret: string): string =>
  `${id}.${secret}`;

export const parseToken = (
  token: string | undefined,
): { id: string; secret: string } | null => {
  if (!token) return null;
  const separator = token.indexOf('.');
  if (separator <= 0 || separator === token.length - 1) return null;
  return { id: token.slice(0, separator), secret: token.slice(separator + 1) };
};

export const secretMatches = (secret: string, hash: string): boolean => {
  const candidate = Buffer.from(hashSecret(secret), 'hex');
  const stored = Buffer.from(hash, 'hex');
  return (
    candidate.length === stored.length && timingSafeEqual(candidate, stored)
  );
};
