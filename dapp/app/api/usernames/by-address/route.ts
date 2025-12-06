import { NextRequest, NextResponse } from 'next/server';
import { getIndexerPool } from '@/lib/db/indexer';

export const revalidate = 0;

interface DbUsername {
  dbid: string;
  username: string;
  user_address: string;
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  const pool = getIndexerPool();
  const addrLower = address.trim().toLowerCase();

  const rows = await pool.query<DbUsername>(
    `
      SELECT username, user_address
      FROM "UsernameRegistered"
      WHERE LOWER(TRIM(user_address)) = $1
    `,
    [addrLower]
  );

  return NextResponse.json(rows.rows);
}
