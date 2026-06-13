import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../lib/require-auth.js";
import { supabase } from "../../lib/supabase.js";

const commentsTable = process.env.SUPABASE_COMMENTS_TABLE ?? "post_comments";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    const status = String(req.query.status ?? "pending");
    const { data, error } = await supabase
      .from(commentsTable)
      .select("id,post_id,name,email,comment,status,created_at")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, items: data ?? [] });
  }

  if (req.method === "PATCH") {
    const id = Number(req.body?.id);
    const status = String(req.body?.status ?? "");
    if (!Number.isFinite(id) || !["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Parametros invalidos" });
    }
    const { error } = await supabase.from(commentsTable).update({ status }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id ?? req.body?.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "id invalido" });
    const { error } = await supabase.from(commentsTable).delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

