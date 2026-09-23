import { Client } from 'pg';
import { loadSecureEnvironment } from '../src/config/secure-env';
import { validateEnvironment } from '../src/config/env.schema';

loadSecureEnvironment();
const env = validateEnvironment(process.env);
if (env.NODE_ENV === 'production') throw new Error('Seed de desenvolvimento bloqueado em produção');
if (!env.DEV_USER_ID || !env.DEV_ORGANIZATION_ID) throw new Error('Configure DEV_USER_ID e DEV_ORGANIZATION_ID');
const client = new Client({ connectionString: env.DATABASE_URL, application_name: 'bomzeika-seed-dev' });
await client.connect();
try {
  await client.query('begin');
  await client.query(`insert into app.organizations(id,legal_name,trade_name,tax_id) values($1,'BOMzeika Desenvolvimento','BOMzeika','00000000000000') on conflict(id) do nothing`,[env.DEV_ORGANIZATION_ID]);
  await client.query(`insert into app.users(id,name,email) values($1,'Administrador de desenvolvimento','admin@localhost.invalid') on conflict(id) do nothing`,[env.DEV_USER_ID]);
  await client.query(`insert into app.organization_members(organization_id,user_id,role_code) values($1,$2,'admin') on conflict(organization_id,user_id) do update set status='active',role_code='admin'`,[env.DEV_ORGANIZATION_ID,env.DEV_USER_ID]);
  await client.query('commit');
  console.log('Organização e usuário de desenvolvimento preparados.');
} catch(error){await client.query('rollback');throw error} finally {await client.end()}
