import { createCipheriv, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const source = resolve(process.argv[2] ?? '.env.local');
const target = resolve(process.argv[3] ?? 'config/runtime.env.encrypted');
const keyFile = process.env.CONFIG_MASTER_KEY_FILE;
const encodedKey = keyFile ? readFileSync(resolve(keyFile), 'utf8').trim() : process.env.CONFIG_MASTER_KEY?.trim();

if (!encodedKey) throw new Error('Informe CONFIG_MASTER_KEY_FILE ou CONFIG_MASTER_KEY fora do repositório');
const key = Buffer.from(encodedKey, 'base64');
if (key.length !== 32) throw new Error('A chave mestra deve conter 32 bytes em base64');

const iv = randomBytes(12);
const cipher = createCipheriv('aes-256-gcm', key, iv);
const ciphertext = Buffer.concat([cipher.update(readFileSync(source)), cipher.final()]);
const envelope = {
  version: 1,
  algorithm: 'aes-256-gcm',
  iv: iv.toString('base64'),
  authTag: cipher.getAuthTag().toString('base64'),
  ciphertext: ciphertext.toString('base64'),
};

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(envelope, null, 2)}\n`, { mode: 0o600 });
console.log(`Configuração criptografada criada em ${target}`);
