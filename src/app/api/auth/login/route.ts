import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  getSessionCookieConfig,
  SESSION_COOKIE_NAME,
  type UserRole,
} from '@/lib/auth/session';

interface LoginBody {
  password?: string;
  role?: UserRole;
}

async function sha256(input: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return new Uint8Array(digest);
}

async function secureCompare(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([sha256(a), sha256(b)]);
  if (hashA.length !== hashB.length) return false;

  let diff = 0;
  for (let i = 0; i < hashA.length; i += 1) {
    diff |= hashA[i] ^ hashB[i];
  }

  return diff === 0;
}

function getPasswordForRole(role: UserRole): string | null {
  if (role === 'admin') {
    return process.env.ADMIN_PASSWORD ?? process.env.APP_PASSWORD ?? null;
  }

  return process.env.VIEWER_PASSWORD ?? null;
}

export async function POST(request: NextRequest) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const role = body.role;
  const password = body.password;

  if ((role !== 'admin' && role !== 'viewer') || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid login payload' }, { status: 400 });
  }

  const expectedPassword = getPasswordForRole(role);
  if (!expectedPassword) {
    return NextResponse.json(
      { error: `${role} password is not configured` },
      { status: 500 }
    );
  }

  const isValid = await secureCompare(password, expectedPassword);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    const { token, payload } = await createSessionToken(role);
    const response = NextResponse.json({
      authenticated: true,
      role: payload.role,
      csrfToken: payload.csrfToken,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieConfig());

    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication service misconfigured' }, { status: 500 });
  }
}
