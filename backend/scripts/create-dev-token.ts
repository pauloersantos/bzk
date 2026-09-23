import { JwtService } from '@nestjs/jwt';
import { loadSecureEnvironment } from '../src/config/secure-env';
import { validateEnvironment } from '../src/config/env.schema';

async function main(): Promise<void> {
  loadSecureEnvironment();
  const env = validateEnvironment(process.env);
  if (env.NODE_ENV === 'production') throw new Error('Token de desenvolvimento é bloqueado em produção');
  if (!env.DEV_USER_ID || !env.DEV_ORGANIZATION_ID) throw new Error('Configure DEV_USER_ID e DEV_ORGANIZATION_ID');
  const jwt = new JwtService({ secret: env.JWT_SECRET });
  const token = await jwt.signAsync(
    { sub: env.DEV_USER_ID, organizationId: env.DEV_ORGANIZATION_ID, roles: ['admin'] },
    { issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE, expiresIn: env.JWT_TTL_SECONDS },
  );
  process.stdout.write(`${token}\n`);
}

void main();
