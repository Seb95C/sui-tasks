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
