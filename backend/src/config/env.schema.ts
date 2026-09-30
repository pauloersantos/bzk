import { z } from 'zod';

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3100),
  API_PREFIX: z.string().min(1).default('api/v1'),
  DATABASE_URL: z.string().url().refine((value) => value.startsWith('postgresql://'), 'Use PostgreSQL'),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default('bomzeika-obras'),
  JWT_AUDIENCE: z.string().min(1).default('bomzeika-obras-api'),
  JWT_TTL_SECONDS: z.coerce.number().int().min(300).max(86400).default(3600),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_TTL_MS: z.coerce.number().int().min(1000).default(60000),
  RATE_LIMIT_DEFAULT: z.coerce.number().int().min(1).default(120),
  RATE_LIMIT_AUTH: z.coerce.number().int().min(1).default(10),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DEV_USER_ID: z.string().uuid().optional(),
  DEV_ORGANIZATION_ID: z.string().uuid().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const result = environmentSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Configuração inválida: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }
  return result.data;
}
