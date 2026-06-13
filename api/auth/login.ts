import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildAuthSetCookie, issueAuthToken, issueMockToken, verifyPassword, authMode } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const username = String(req.body?.username ?? "");
    const password = String(req.body?.password ?? "");

    if (authMode() === "database") {
      const userField = username.trim();
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, username, email, role, password_hash, is_active")
        .or(`username.eq.${userField},email.eq.${userField}`)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ ok: false, error: "Falha ao consultar usuario", detail: error.message });
      }
      if (!data || !data.is_active) {
        return res.status(401).json({ ok: false, error: "Credenciais invalidas" });
      }
      if (!verifyPassword(password, String(data.password_hash ?? ""))) {
        return res.status(401).json({ ok: false, error: "Credenciais invalidas" });
      }

      const token = issueAuthToken({
        username: String(data.username),
        role: String(data.role ?? "editor"),
        userId: String(data.id)
      });
      res.setHeader("Set-Cookie", buildAuthSetCookie(token));
      return res.status(200).json({
        ok: true,
        user: { username: data.username, role: data.role ?? "editor" }
      });
    }

    const mockUser = required("COCKPIT_AUTH_USER");
    const mockPassword = required("COCKPIT_AUTH_PASSWORD");
    if (username !== mockUser || password !== mockPassword) {
      return res.status(401).json({ ok: false, error: "Credenciais invalidas" });
    }
    const token = issueMockToken(username);
    res.setHeader("Set-Cookie", buildAuthSetCookie(token));
    return res.status(200).json({
      ok: true,
      user: { username }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ ok: false, error: message });
  }
}
