import type { VercelResponse } from "@vercel/node";

/** CORS para o site público chamar APIs do cockpit (ex.: contagem de views). */
export function applyPublicCors(res: VercelResponse): void {
  const origin = process.env.PUBLIC_SITE_ORIGIN ?? "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function preflightPublic(reqMethod: string | undefined, res: VercelResponse): boolean {
  if (reqMethod === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
