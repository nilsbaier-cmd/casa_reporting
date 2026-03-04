import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionToken);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      role: null,
      csrfToken: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    role: session.role,
    csrfToken: session.csrfToken,
  });
}
