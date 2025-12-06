import { UsernameRecord } from '@/types/user';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request to ${path} failed`);
  }
  return res.json() as Promise<T>;
}

export async function fetchUsernameByAddress(address: string): Promise<UsernameRecord | null> {
  const addr = address.trim();
  if (!addr) return null;

  const records = await request<UsernameRecord[]>(
    `/api/usernames/by-address?address=${encodeURIComponent(addr)}`,
  );

  return records[0] || null;
}

export async function fetchAddressByUsername(username: string): Promise<{ username: string; address: string } | null> {
  const user = username.trim();
  if (!user) return null;

  try {
    const result = await request<{ username: string; address: string }>(
      `/api/usernames/by-username?username=${encodeURIComponent(user)}`,
    );
    return result;
  } catch (error) {
    // Return null if username not found (404)
    return null;
  }
}
