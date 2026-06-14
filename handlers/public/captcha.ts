import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyPublicCors, preflightPublic } from "../../lib/cors-public.js";
import { issueSimpleCaptcha } from "../../lib/captcha.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  applyPublicCors(res);
  if (preflightPublic(req.method, res)) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const captcha = issueSimpleCaptcha();
  return res.status(200).json({ ok: true, question: captcha.question, token: captcha.token });
}

