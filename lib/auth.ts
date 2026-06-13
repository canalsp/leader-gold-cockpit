import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cockpit_auth";
const AUTH_MODE = process.env.COCKPIT_AUTH_MODE ?? "mock";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string): string {
  const secret = required("COCKPIT_AUTH_SECRET");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function issueMockToken(username: string): string {
  const payload = JSON.stringify({
    username,
    exp: Date.now() + 1000 * 60 * 60 * 8
  });

  const payloadEncoded = base64UrlEncode(payload);
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function issueAuthToken(payload: { username: string; role?: string; userId?: string }): string {
  const data = JSON.stringify({
    username: payload.username,
    role: payload.role ?? "editor",
    userId: payload.userId ?? null,
    exp: Date.now() + 1000 * 60 * 60 * 8
  });
  const payloadEncoded = base64UrlEncode(data);
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function verifyMockToken(token: string): { username: string; role?: string; userId?: string } | null {
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return null;
  }

  const expected = sign(payloadEncoded);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as {
      username: string;
      role?: string;
      userId?: string;
      exp: number;
    };
    if (!payload.username || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return { username: payload.username, role: payload.role, userId: payload.userId };
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, entry) => {
    const [rawKey, ...rawValue] = entry.trim().split("=");
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = rawValue.join("=");
    return acc;
  }, {});
}

export function getUserFromRequest(cookieHeader?: string): { username: string; role?: string; userId?: string } | null {
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) {
    return null;
  }
  return verifyMockToken(token);
}

export function authMode(): "mock" | "database" {
  return AUTH_MODE === "database" ? "database" : "mock";
}

export function hashPasswordScrypt(plain: string, salt?: string): string {
  const s = salt ?? randomBytes(16).toString("hex");
  const key = scryptSync(plain, s, 64).toString("hex");
  return `scrypt$${s}$${key}`;
}

export function verifyPassword(plain: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.startsWith("scrypt$")) {
    const [, salt, expected] = storedHash.split("$");
    if (!salt || !expected) return false;
    const candidate = scryptSync(plain, salt, 64).toString("hex");
    const a = Buffer.from(candidate, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
  // Compatibilidade temporária com dados antigos em texto puro.
  return plain === storedHash;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function buildAuthSetCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800;${secure}`;
}

export function buildAuthClearCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;${secure}`;
}
