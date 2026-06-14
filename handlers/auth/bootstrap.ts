import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hashPasswordScrypt } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Cria o primeiro usuário admin quando COCKPIT_AUTH_MODE=database.
 * Protegido por COCKPIT_BOOTSTRAP_SECRET.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const configured = process.env.COCKPIT_BOOTSTRAP_SECRET;
  if (!configured) {
    return res.status(400).json({ error: "COCKPIT_BOOTSTRAP_SECRET nao configurado" });
  }

  const secret = String(req.body?.secret ?? "");
  if (!secret || secret !== configured) {
    return res.status(401).json({ error: "Nao autorizado" });
  }

  try {
    const username = String(req.body?.username ?? "").trim() || required("COCKPIT_AUTH_USER");
    const email = String(req.body?.email ?? "").trim() || `${username}@local.invalid`;
    const plainPassword = String(req.body?.password ?? "").trim() || required("COCKPIT_AUTH_PASSWORD");
    const passwordHash = hashPasswordScrypt(plainPassword);

    const { data, error } = await supabase
      .from("admin_users")
      .upsert(
        {
          username,
          email,
          role: "admin",
          is_active: true,
          password_hash: passwordHash
        },
        { onConflict: "username" }
      )
      .select("id, username, email, role")
      .single();

    if (error) {
      return res.status(500).json({ error: "Falha ao criar usuario admin", detail: error.message });
    }

    return res.status(200).json({ ok: true, user: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

