export type UserRole = 'admin' | 'viewer';

export interface SessionPayload {
  role: UserRole;
  exp: number;
  csrfToken: string;
}

export const SESSION_COOKIE_NAME = 'casa_session';
export const CSRF_HEADER_NAME = 'x-csrf-token';
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const textEncoder = new TextEncoder();

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is not configured');
  }

  return 'dev-only-auth-secret-change-me';
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(getAuthSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signPayload(payload: string): Promise<string> {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  try {
    const key = await getSigningKey();
    const signatureBytes = new Uint8Array(fromBase64Url(signature));
    return crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      textEncoder.encode(payload)
    );
  } catch {
    return false;
  }
}

export async function createSessionToken(
  role: UserRole,
  ttlSeconds = SESSION_TTL_SECONDS
): Promise<{ token: string; payload: SessionPayload }> {
  const payload: SessionPayload = {
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    csrfToken: crypto.randomUUID(),
  };

  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = toBase64Url(textEncoder.encode(payloadJson));
  const signature = await signPayload(payloadEncoded);

  return {
    token: `${payloadEncoded}.${signature}`,
    payload,
  };
}

function isValidSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<SessionPayload>;

  return (
    (candidate.role === 'admin' || candidate.role === 'viewer') &&
    typeof candidate.exp === 'number' &&
    Number.isFinite(candidate.exp) &&
    typeof candidate.csrfToken === 'string' &&
    candidate.csrfToken.length > 0
  );
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return null;

  const isValidSig = await verifySignature(payloadEncoded, signature);
  if (!isValidSig) return null;

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const parsed = JSON.parse(payloadJson);

    if (!isValidSessionPayload(parsed)) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function getSessionCookieConfig(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}
