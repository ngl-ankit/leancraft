import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import * as schema from '@/db/schema';

// The Turso client is created lazily (on first actual use) instead of at
// module-import time. Next.js evaluates every API route module during
// `next build` (page data collection), which would otherwise crash the
// production build with "URL_INVALID" whenever TURSO_CONNECTION_URL /
// TURSO_AUTH_TOKEN aren't available as *build-time* env vars (e.g. on
// Render, where env vars are typically only injected at runtime).
let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error(
      'Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN environment variables.'
    );
  }

  _client = createClient({ url, authToken });
  return _client;
}

// `db` is a Proxy that defers creating the real libSQL client + drizzle
// instance until a property on it is actually accessed (e.g. db.select()).
// This keeps module import side-effect free and safe to evaluate during
// build, while behaving exactly like a normal drizzle instance at runtime.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (_db) return _db;
  _db = drizzle(getClient(), { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

export type Database = typeof db;
