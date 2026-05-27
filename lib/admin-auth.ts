const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE;

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function encodePayload(exp: number): string {
  return btoa(JSON.stringify({ exp }));
}

function decodePayload(encoded: string): { exp: number } | null {
  try {
    const data = JSON.parse(atob(encoded)) as { exp?: number };
    if (typeof data.exp !== "number") return null;
    return { exp: data.exp };
  } catch {
    return null;
  }
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function hmacVerify(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  try {
    const binary = atob(signature);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }
    return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(message));
  } catch {
    return false;
  }
}

export async function createSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or ADMIN_PASSWORD is required");
  }
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = encodePayload(exp);
  const sig = await hmacSign(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token || !isAdminAuthConfigured()) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, sig] = parts;
  const valid = await hmacVerify(payload, sig, secret);
  if (!valid) return false;

  const data = decodePayload(payload);
  if (!data) return false;

  return data.exp > Math.floor(Date.now() / 1000);
}

export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;

  const normalized = normalizeLoginPassword(password);

  if (normalized.length !== expected.length) return false;

  let result = 0;
  for (let i = 0; i < normalized.length; i++) {
    result |= normalized.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

/** コピペ時の ADMIN_PASSWORD= 付き入力や前後空白を吸収 */
export function normalizeLoginPassword(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/^ADMIN_PASSWORD\s*=\s*(.+)$/i);
  return match ? match[1].trim() : trimmed;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
