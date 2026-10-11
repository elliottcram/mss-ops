// Runs every migration, then every test file, on a throwaway in-memory
// Postgres (PGlite). No Supabase account needed.  Usage: npm run test:db
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../supabase/', import.meta.url).pathname;
const db = new PGlite();

// Things Supabase provides that a bare Postgres doesn't.
await db.exec(`
  create schema auth;
  create function auth.uid() returns uuid language sql stable as 'select null::uuid';
  create role anon; create role authenticated;
`);

const run = async (dir) => {
  for (const f of readdirSync(join(root, dir)).filter((f) => f.endsWith('.sql')).sort()) {
    try {
      await db.exec(readFileSync(join(root, dir, f), 'utf8'));
      console.log(`ok   ${dir}/${f}`);
    } catch (e) {
      console.error(`FAIL ${dir}/${f}\n     ${e.message}`);
      process.exit(1);
    }
  }
};

await run('migrations');
await run('tests');
console.log('All migrations applied and all tests passed.');
