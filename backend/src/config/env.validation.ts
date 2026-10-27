import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  /** Comma-separated list of allowed browser origins. */
  FRONTEND_URLS: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_DOMAIN: z.string().optional(),
  /** Public frontend URL used to build links in emails. */
  APP_URL: z.url(),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  INVITE_TTL_HOURS: z.coerce.number().int().positive().default(72),
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  // z.coerce.boolean() would turn the string "false" into true.
  MAIL_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().min(1).default('Flowdesk <no-reply@flowdesk.local>'),
});

export type Env = z.infer<typeof envSchema>;

/** Fails fast at startup when a variable is missing or malformed. */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return result.data;
}

export const getAllowedOrigins = (value: string): string[] =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
