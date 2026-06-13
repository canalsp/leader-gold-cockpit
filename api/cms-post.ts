import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../lib/require-auth.js";
import { postsTable, supabase } from "../lib/supabase.js";
import {
  parseCmsPayload,
  rowForInsert,
  rowForUpdate
} from "../services/cms-post.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) {
    return;
  }

  try {
    if (req.method === "GET") {
      const idParam = req.query.id;
      const raw = Array.isArray(idParam) ? idParam[0] : idParam;
      const id = raw ? Number(raw) : NaN;
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: "id obrigatorio" });
      }
      const { data, error } = await supabase.from(postsTable).select("*").eq("id", id).maybeSingle();
      if (error) {
        return res.status(500).json({ error: "Falha ao buscar post", detail: error.message });
      }
      if (!data) {
        return res.status(404).json({ error: "Post nao encontrado" });
      }
      return res.status(200).json({ ok: true, post: data });
    }

    if (req.method === "POST") {
      const payload = parseCmsPayload(req.body);
      const row = rowForInsert(payload);
      const { data, error } = await supabase.from(postsTable).insert(row).select("*").single();
      if (error) {
        return res.status(500).json({ error: "Falha ao criar post", detail: error.message });
      }
      return res.status(201).json({ ok: true, post: data });
    }

    if (req.method === "PATCH") {
      const payload = parseCmsPayload(req.body);
      if (!payload.id) {
        return res.status(400).json({ error: "id obrigatorio para atualizar" });
      }
      const row = rowForUpdate(payload);
      const { data, error } = await supabase
        .from(postsTable)
        .update(row)
        .eq("id", payload.id)
        .select("*")
        .maybeSingle();
      if (error) {
        return res.status(500).json({ error: "Falha ao atualizar post", detail: error.message });
      }
      if (!data) {
        return res.status(404).json({ error: "Post nao encontrado" });
      }
      return res.status(200).json({ ok: true, post: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return res.status(400).json({ error: msg });
  }
}
