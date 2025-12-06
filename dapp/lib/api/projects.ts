import { Project } from '@/types/project';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request to ${path} failed`);
  }

  return res.json() as Promise<T>;
}

export async function fetchProjectsByAddress(address: string): Promise<Project[]> {
  const addr = address.trim();
  if (!addr) return [];
  return request<Project[]>(`/api/projects/by-address?address=${encodeURIComponent(addr)}`);
}
