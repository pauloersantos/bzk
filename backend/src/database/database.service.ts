import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { AuthenticatedUser } from '../common/auth/auth.types';

export interface TransactionContext extends AuthenticatedUser { requestId?: string }

/**
 * Ponto único de acesso ao PostgreSQL.
 *
 * Consultas de negócio devem executar por `withContext`: a função abre uma
 * transação e injeta organização, usuário e requestId em parâmetros locais do
 * PostgreSQL. As políticas RLS e os gatilhos de auditoria usam esses parâmetros.
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    this.pool = new Pool({
      connectionString: config.getOrThrow<string>('database.url'),
      application_name: 'bomzeika-obras-api',
      max: 15,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      allowExitOnIdle: false,
    });
  }

  async onModuleDestroy(): Promise<void> { await this.pool.end(); }

  async ping(): Promise<void> { await this.pool.query('select 1'); }

  /** Uso restrito ao fluxo de autenticação antes de existir um contexto RLS. */
  systemQuery<T extends QueryResultRow>(text: string, values: readonly unknown[] = []): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, values as unknown[]);
  }

  /**
   * Executa uma unidade de trabalho no contexto autenticado.
   * `set_config(..., true)` limita os valores à transação e impede vazamento de
   * identidade quando uma conexão do pool é reutilizada por outra requisição.
   */
  async withContext<T>(context: TransactionContext, callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query(`select
        set_config('app.organization_id', $1, true),
        set_config('app.user_id', $2, true),
        set_config('app.request_id', $3, true)`, [context.organizationId, context.userId, context.requestId ?? '']);
      const result = await callback(client);
      await client.query('commit');
      return result;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  /** Executa SQL parametrizado na conexão transacional já contextualizada. */
  query<T extends QueryResultRow>(client: PoolClient, text: string, values: readonly unknown[] = []): Promise<QueryResult<T>> {
    return client.query<T>(text, values as unknown[]);
  }
}
