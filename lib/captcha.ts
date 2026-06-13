import { createHmac, randomInt } from "node:crypto";

function secret(): string {
  return process.env.COCKPIT_CAPTCHA_SECRET || process.env.COCKPIT_AUTH_SECRET || "local-captcha-secret";
}

function sign(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

function b64(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function unb64(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function issueSimpleCaptcha(): { question: string; token: string } {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const payload = JSON.stringify({
    answer: a + b,
    exp: Date.now() + 1000 * 60 * 10
  });
  const payloadB64 = b64(payload);
  const signature = sign(payloadB64);
  return {
    question: `Quanto é ${a} + ${b}?`,
    token: `${payloadB64}.${signature}`
  };
}

export function verifySimpleCaptcha(token: string, answerRaw: string): boolean {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;
  const expected = sign(payloadB64);
  if (expected !== sig) return false;
  try {
    const payload = JSON.parse(unb64(payloadB64)) as { answer: number; exp: number };
    if (!payload?.exp || payload.exp < Date.now()) return false;
    const answer = Number(String(answerRaw ?? "").trim());
    return Number.isFinite(answer) && answer === payload.answer;
  } catch {
    return false;
  }
}

