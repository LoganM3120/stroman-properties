import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

interface RateLimitBucket {
  count: number;
  expiresAt: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function trackRateLimit(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith('/api/admin/')) {
    return null;
  }

  const now = Date.now();
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() ?? realIp ?? request.nextUrl.hostname ?? 'unknown';
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || bucket.expiresAt < now) {
    rateLimitBuckets.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  bucket.count += 1;
  rateLimitBuckets.set(ip, bucket);
  return null;
}

export function middleware(request: NextRequest) {
  const rateLimitResponse = trackRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
