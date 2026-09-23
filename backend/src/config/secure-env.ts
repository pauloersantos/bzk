import { createDecipheriv } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface EncryptedEnvelope {
  version: 1;
  algorithm: 'aes-256-gcm';
  iv: string;
  authTag: string;
  ciphertext: string;
}

/**
 * Obtém a chave de bootstrap usada para abrir o envelope de configuração.
 *
 * A chave nunca é lida do próprio envelope. Em produção, o caminho recomendado
 * é `CONFIG_MASTER_KEY_FILE`, apontando para um arquivo montado pelo gerenciador
 * de segredos. A variável direta existe para ambientes que não suportam mount.
 */
function readMasterKey(): Buffer | undefined {
  const keyFile = process.env.CONFIG_MASTER_KEY_FILE;
  const encoded = keyFile
    ? readFileSync(resolve(keyFile), 'utf8').trim()
    : process.env.CONFIG_MASTER_KEY?.trim();
  if (!encoded) return undefined;
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('CONFIG_MASTER_KEY deve conter 32 bytes em base64');
  return key;
}

/** Converte o formato KEY=VALUE sem interpretar comandos ou expansões de shell. */
function parseEnvText(text: string): Record<string, string> {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        if (separator < 1) throw new Error(`Linha de configuração inválida: ${line}`);
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

/**
 * Carrega a configuração operacional protegida por AES-256-GCM.
 *
 * O GCM autentica o conteúdo antes de disponibilizá-lo ao processo. Variáveis
 * já fornecidas pelo ambiente têm precedência, o que permite rotação gradual de
 * segredos sem regravar o envelope. Produção falha de forma fechada quando o
 * envelope ou a chave externa não estão disponíveis.
 */
export function loadSecureEnvironment(): void {
  const encryptedPath = resolve(process.env.ENCRYPTED_ENV_FILE ?? 'config/runtime.env.encrypted');
  if (!existsSync(encryptedPath)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Configuração criptografada obrigatória em produção');
    }
    return;
  }

  const key = readMasterKey();
  if (!key) throw new Error('Chave mestra externa ausente para descriptografar a configuração');
  const envelope = JSON.parse(readFileSync(encryptedPath, 'utf8')) as EncryptedEnvelope;
  if (envelope.version !== 1 || envelope.algorithm !== 'aes-256-gcm') {
    throw new Error('Formato de configuração criptografada não suportado');
  }

  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.authTag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');

  for (const [name, value] of Object.entries(parseEnvText(plaintext))) {
    if (process.env[name] === undefined) process.env[name] = value;
  }
}
