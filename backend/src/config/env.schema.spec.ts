import { validateEnvironment } from './env.schema';

describe('validateEnvironment', () => {
  const valid = {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://user:password@localhost:5432/bomzeika_test',
    JWT_SECRET: '0123456789abcdef0123456789abcdef',
  };

  it('aplica padrões seguros e converte valores numéricos', () => {
    const result = validateEnvironment({ ...valid, PORT: '3200', RATE_LIMIT_DEFAULT: '40' });

    expect(result.PORT).toBe(3200);
    expect(result.API_PREFIX).toBe('api/v1');
    expect(result.RATE_LIMIT_DEFAULT).toBe(40);
    expect(result.JWT_TTL_SECONDS).toBe(3600);
  });

  it('rejeita segredo JWT fraco e banco que não seja PostgreSQL', () => {
    expect(() => validateEnvironment({ ...valid, JWT_SECRET: 'curto' })).toThrow('JWT_SECRET');
    expect(() => validateEnvironment({ ...valid, DATABASE_URL: 'mysql://localhost/test' })).toThrow('DATABASE_URL');
  });
});
