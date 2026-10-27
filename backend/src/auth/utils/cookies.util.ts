import type { CookieOptions, Response } from 'express';
import type { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.validation';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

export type SessionTokens = { accessToken: string; refreshToken: string };

const baseOptions = (config: ConfigService<Env, true>): CookieOptions => {
  const env = config.get('NODE_ENV', { infer: true });
  const isDeployed = env === 'production' || env === 'staging';
  return {
    httpOnly: true,
    secure: isDeployed,
    sameSite: 'lax',
    path: '/',
    domain: config.get('COOKIE_DOMAIN', { infer: true }) || undefined,
  };
};

export const setAuthCookies = (
  res: Response,
  tokens: SessionTokens,
  config: ConfigService<Env, true>,
) => {
  const options = baseOptions(config);
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...options,
    maxAge: config.get('JWT_ACCESS_TTL_SECONDS', { infer: true }) * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...options,
    maxAge:
      config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }) *
      24 *
      60 *
      60 *
      1000,
  });
};

export const clearAuthCookies = (
  res: Response,
  config: ConfigService<Env, true>,
) => {
  const options = baseOptions(config);
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
};

/** Reads one cookie from a raw `Cookie` header (used by the socket handshake). */
export const readCookie = (
  header: string | undefined,
  name: string,
): string | undefined => {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
};
