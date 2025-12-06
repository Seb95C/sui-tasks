import { NextRequest, NextResponse } from 'next/server';
import { getIndexerPool } from '@/lib/db/indexer';

export const revalidate = 0;

interface DbUsername {
  dbid: string;
  username: string;
  user_address: string;
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 });
  }

  const useMock = process.env.USE_INDEXER_MOCK === 'true';
  const usernameLower = username.trim().toLowerCase();

  if (useMock) {
    const { mockUsers } = await import('@/lib/mock/data');
    const match = mockUsers.find((u: any) => u.username.toLowerCase() === usernameLower);

    if (!match) {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    return NextResponse.json({
      username: match.username,
      address: match.address,
    });
  }

  try {
    const pool = getIndexerPool();

    const rows = await pool.query<DbUsername>(
      `
        SELECT username, user_address
        FROM "UsernameRegistered"
        WHERE LOWER(TRIM(username)) = $1
        LIMIT 1
      `,
      [usernameLower],
    );

    if (rows.rowCount === 0) {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    const user = rows.rows[0];
    return NextResponse.json({
      username: user.username,
      address: user.user_address,
    });
  } catch (err: any) {
    console.error('Failed to fetch user by username', err);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
