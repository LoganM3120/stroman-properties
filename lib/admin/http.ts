import { getOwnerDashboardSecret } from './auth';

function getApiBaseUrl(): string {
  return (
    process.env.INTERNAL_API_BASE_URL?.trim() ||
    process.env.BOOKINGS_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    'http://localhost:3000'
  );
}

interface PostOptions {
  body?: unknown;
}

export async function postAdminApi(path: string, options: PostOptions = {}): Promise<void> {
  const secret = getOwnerDashboardSecret();
  const url = new URL(path, getApiBaseUrl());
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-owner-dashboard-secret': secret,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request to ${path} failed (${response.status})`);
  }
}
