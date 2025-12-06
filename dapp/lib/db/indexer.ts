/**
 * Lightweight Postgres pool helper for the Next.js API routes.
 * Falls back with a descriptive error if `pg` is not installed.
 */

let pool: any;

export function getIndexerPool() {
  if (pool) return pool;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to query the indexer database');
  }

  let PgPool: any;
  try {
    // Lazy require to avoid build-time failures if pg is absent.
    PgPool = require('pg').Pool;
  } catch (err) {
    throw new Error(
      'The "pg" dependency is missing. Install pg or set up USE_INDEXER_MOCK to use mock data.',
    );
  }

  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  return pool;
}
