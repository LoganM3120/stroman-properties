import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE = 'admin_session';
const SECRET_HEADER = 'x-owner-dashboard-secret';
const LEGACY_SECRET_HEADER = 'x-admin-secret';

function readSecret(): string | null {
  const secret =
    process.env.OWNER_DASHBOARD_SECRET?.trim() || process.env.ADMIN_API_SECRET?.trim() || null;
  return secret && secret.length > 0 ? secret : null;
}

export function getOwnerDashboardSecret(): string {
  const secret = readSecret();
  if (!secret) {
    throw new Error('OWNER_DASHBOARD_SECRET is not configured');
  }
  return secret;
}

function buildSessionToken(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function matchesSecret(value: string | null, secret: string): boolean {
  if (!value) {
    return false;
  }
  const providedBuffer = Buffer.from(value);
  const secretBuffer = Buffer.from(secret);
  if (providedBuffer.length !== secretBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedBuffer, secretBuffer);
}

export async function hasOwnerSession(): Promise<boolean> {
  const secret = readSecret();
  if (!secret) {
    return false;
  }

  const headerStore = await headers();
  const providedHeader =
    headerStore.get(SECRET_HEADER)?.trim() ?? headerStore.get(LEGACY_SECRET_HEADER)?.trim();
  if (matchesSecret(providedHeader ?? null, secret)) {
    return true;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  if (!cookieValue) {
    return false;
  }

  const expected = buildSessionToken(secret);
  return matchesSecret(cookieValue, expected);
}

export async function requireOwnerSession(): Promise<void> {
  if (!(await hasOwnerSession())) {
    redirect('/admin/login');
  }
}

export async function createOwnerSessionCookie(): Promise<void> {
  const secret = getOwnerDashboardSecret();
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: buildSessionToken(secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearOwnerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export interface OwnerRequestContext {
  actor: string;
}

function extractBearer(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function requireOwner(request: Request): OwnerRequestContext {
  const secret = getOwnerDashboardSecret();
  const providedHeader =
    request.headers.get(SECRET_HEADER)?.trim() ?? request.headers.get(LEGACY_SECRET_HEADER)?.trim();
  const bearer = extractBearer(request.headers.get('authorization'));

  const provided = providedHeader ?? bearer ?? null;
  if (matchesSecret(provided, secret)) {
    return { actor: 'admin-secret' };
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const expectedToken = buildSessionToken(secret);
  const hasSession = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie === `${SESSION_COOKIE}=${expectedToken}`);

  if (!hasSession) {
    throw new Error('Unauthorized');
  }

  return { actor: 'admin-session' };
}
