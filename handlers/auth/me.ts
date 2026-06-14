import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserFromRequest } from "../../lib/auth.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = getUserFromRequest(req.headers.cookie);
  if (!user) {
    // 200 evita "Failed to load resource" no console ao abrir o cockpit sem sessao
    return res.status(200).json({ ok: false, user: null });
  }

  return res.status(200).json({ ok: true, user: { username: user.username, role: user.role ?? "admin" } });
}
