import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (!secret || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      return NextResponse.json(
        { error: 'Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN' },
        { status: 500 }
      );
    }

    const client = createClient({ url, authToken });
    const db = drizzle(client);

    await migrate(db, { migrationsFolder: './drizzle' });

    return NextResponse.json({ success: true, message: 'Migration completed' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
