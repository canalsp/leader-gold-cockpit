import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyPublicCors, preflightPublic } from "../../lib/cors-public.js";
import { postsTable, supabase } from "../../lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyPublicCors(res);
  if (preflightPublic(req.method, res)) {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = typeof req.body?.slug === "string" ? req.body.slug.trim() : "";
  if (!slug) {
    return res.status(400).json({ error: "slug obrigatorio" });
  }

  const { data: row, error: selErr } = await supabase
    .from(postsTable)
    .select("id, view_count, status, published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (selErr) {
    return res.status(500).json({ error: selErr.message });
  }
  if (!row) {
    return res.status(404).json({ error: "Post nao encontrado" });
  }

  const now = Date.now();
  const pubAt = row.published_at ? new Date(row.published_at).getTime() : null;

  if (row.status === "published") {
    if (pubAt != null && Number.isFinite(pubAt) && pubAt > now) {
      return res.status(404).json({ error: "Post nao encontrado" });
    }
  } else if (row.status === "scheduled") {
    if (pubAt == null || !Number.isFinite(pubAt) || pubAt > now) {
      return res.status(404).json({ error: "Post nao encontrado" });
    }
  } else {
    return res.status(404).json({ error: "Post nao encontrado" });
  }

  const next = Number(row.view_count ?? 0) + 1;
  const { error: upErr } = await supabase.from(postsTable).update({ view_count: next }).eq("id", row.id);

  if (upErr) {
    return res.status(500).json({ error: upErr.message });
  }

  return res.status(200).json({ ok: true, view_count: next });
}
