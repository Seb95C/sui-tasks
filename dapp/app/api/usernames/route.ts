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

  const useMock = process.env.USE_INDEXER_MOCK === 'true';
  const addrLower = address.trim().toLowerCase();

  if (useMock) {
    const { mockUsers } = await import('@/lib/mock/data');
    const match = mockUsers
      .filter((u: any) => u.address.toLowerCase() === addrLower)
      .map((u: any, idx: number) => ({
        dbid: `mock-${idx}`,
        username: u.username || '',
        user_address: u.address,
      }));
    return NextResponse.json(match);
  }

  try {
    const pool = getIndexerPool();

    const rows = await pool.query<DbUsername>(
      `
        SELECT dbid, username, user_address
        FROM "UsernameRegistered"
        WHERE LOWER(TRIM(user_address)) = $1
        ORDER BY dbid ASC
      `,
      [addrLower],
    );

    return NextResponse.json(rows.rows);
  } catch (err: any) {
    console.error('Failed to fetch username', err);
    return NextResponse.json({ error: 'Failed to fetch username' }, { status: 500 });
  }
}
