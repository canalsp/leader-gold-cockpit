import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserFromRequest } from "./auth.js";

export type AuthUser = { username: string; role?: string; userId?: string };

export function requireAuth(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = getUserFromRequest(req.headers.cookie);
  if (!user) {
    res.status(401).json({ ok: false, error: "Nao autenticado" });
    return null;
  }
  return user;
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role && user.role !== "admin") {
    res.status(403).json({ ok: false, error: "Acesso restrito a administradores" });
    return null;
  }
  return user;
}
