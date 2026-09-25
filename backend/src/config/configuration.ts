import { validateEnvironment } from './env.schema';

export const configuration = () => {
  const env = validateEnvironment(process.env);
  return {
    app: { environment: env.NODE_ENV, port: env.PORT, prefix: env.API_PREFIX },
    database: { url: env.DATABASE_URL },
    jwt: {
      secret: env.JWT_SECRET,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      ttlSeconds: env.JWT_TTL_SECONDS,
    },
    cors: { origins: env.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean) },
    rateLimit: { ttlMs: env.RATE_LIMIT_TTL_MS, defaultLimit: env.RATE_LIMIT_DEFAULT, authLimit: env.RATE_LIMIT_AUTH },
    logging: { level: env.LOG_LEVEL },
    development: { userId: env.DEV_USER_ID, organizationId: env.DEV_ORGANIZATION_ID },
  };
};
