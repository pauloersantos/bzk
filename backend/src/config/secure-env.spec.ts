import { createCipheriv, randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSecureEnvironment } from './secure-env';

describe('loadSecureEnvironment', () => {
  const original = { ...process.env };
  let directory: string;

  beforeEach(() => {
    process.env = { ...original, NODE_ENV: 'test' };
    delete process.env.SECURE_TEST_VALUE;
    directory = mkdtempSync(join(tmpdir(), 'bomzeika-secure-env-'));
  });

  afterEach(() => {
    process.env = { ...original };
    rmSync(directory, { recursive: true, force: true });
  });

  it('descriptografa AES-256-GCM e não sobrescreve variáveis externas', () => {
    const key = randomBytes(32);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update('SECURE_TEST_VALUE=arquivo\nEXTERNAL_WINS=arquivo'), cipher.final()]);
    const encryptedFile = join(directory, 'runtime.env.encrypted');
    writeFileSync(encryptedFile, JSON.stringify({
      version: 1,
      algorithm: 'aes-256-gcm',
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    }));
    process.env.ENCRYPTED_ENV_FILE = encryptedFile;
    process.env.CONFIG_MASTER_KEY = key.toString('base64');
    process.env.EXTERNAL_WINS = 'ambiente';

    loadSecureEnvironment();

    expect(process.env.SECURE_TEST_VALUE).toBe('arquivo');
    expect(process.env.EXTERNAL_WINS).toBe('ambiente');
  });
});
