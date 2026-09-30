import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { loadSecureEnvironment } from '../src/config/secure-env';
import { validateEnvironment } from '../src/config/env.schema';

/** Aplica migrações imutáveis e recusa arquivos já executados que foram alterados. */
async function main(): Promise<void> {
  loadSecureEnvironment();
  const env = validateEnvironment(process.env);
  const command = process.argv[2] ?? 'status';
  const client = new Client({ connectionString: env.DATABASE_URL, application_name: 'bomzeika-migrator' });
  await client.connect();

  try {
    await client.query(`create table if not exists public.schema_migrations (
      migration_id text primary key,
      checksum text not null,
      applied_at timestamptz not null default clock_timestamp()
    )`);
    const migrations = readdirSync(resolve('migrations')).filter((file) => file.endsWith('.sql')).sort();
    const rows = await client.query<{ migration_id: string; checksum: string }>('select migration_id, checksum from public.schema_migrations');
    const applied = new Map(rows.rows.map((row) => [row.migration_id, row.checksum]));

    if (command === 'status') {
      for (const file of migrations) console.log(`${applied.has(file) ? 'aplicada' : 'pendente'}  ${file}`);
      return;
    }
    if (command !== 'up') throw new Error(`Comando desconhecido: ${command}`);

    for (const file of migrations) {
      const sql = readFileSync(resolve('migrations', file), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      if (applied.has(file)) {
        if (applied.get(file) !== checksum) throw new Error(`Migração aplicada foi alterada: ${file}`);
        continue;
      }

      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into public.schema_migrations(migration_id, checksum) values ($1, $2)', [file, checksum]);
        await client.query('commit');
        console.log(`aplicada  ${file}`);
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

void main();
