import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hashPasswordScrypt } from "../../lib/auth.js";
import { requireAdmin } from "../../lib/require-auth.js";
import { supabase } from "../../lib/supabase.js";

function cleanRole(value: unknown): "admin" | "editor" | "author" {
  const role = String(value ?? "editor");
  if (role === "admin" || role === "author") return role;
  return "editor";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAdmin(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id,username,email,role,is_active,last_login_at,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, items: data ?? [] });
  }

  if (req.method === "POST") {
    const username = String(req.body?.username ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const role = cleanRole(req.body?.role);
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email e password obrigatorios" });
    }
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        username,
        email,
        role,
        is_active: true,
        password_hash: hashPasswordScrypt(password)
      })
      .select("id,username,email,role,is_active")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, item: data });
  }

  if (req.method === "PATCH") {
    const id = String(req.body?.id ?? "").trim();
    if (!id) return res.status(400).json({ error: "id obrigatorio" });
    const payload: Record<string, unknown> = {};
    if (req.body?.username != null) payload.username = String(req.body.username).trim();
    if (req.body?.email != null) payload.email = String(req.body.email).trim().toLowerCase();
    if (req.body?.role != null) payload.role = cleanRole(req.body.role);
    if (req.body?.is_active != null) payload.is_active = Boolean(req.body.is_active);
    if (req.body?.password) payload.password_hash = hashPasswordScrypt(String(req.body.password));
    const { data, error } = await supabase
      .from("admin_users")
      .update(payload)
      .eq("id", id)
      .select("id,username,email,role,is_active")
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, item: data });
  }

  if (req.method === "DELETE") {
    const id = String(req.query.id ?? req.body?.id ?? "").trim();
    if (!id) return res.status(400).json({ error: "id obrigatorio" });
    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

