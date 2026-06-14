import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyPublicCors, preflightPublic } from "../../lib/cors-public.js";
import { verifySimpleCaptcha } from "../../lib/captcha.js";
import { postsTable, supabase } from "../../lib/supabase.js";

const commentsTable = process.env.SUPABASE_COMMENTS_TABLE ?? "post_comments";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyPublicCors(res);
  if (preflightPublic(req.method, res)) return;

  if (req.method === "GET") {
    const slug = String(req.query.slug ?? "").trim();
    if (!slug) return res.status(400).json({ error: "slug obrigatorio" });
    const { data: post, error: postErr } = await supabase.from(postsTable).select("id").eq("slug", slug).maybeSingle();
    if (postErr) return res.status(500).json({ error: postErr.message });
    if (!post) return res.status(200).json({ ok: true, items: [] });
    const { data, error } = await supabase
      .from(commentsTable)
      .select("id,name,comment,created_at")
      .eq("post_id", post.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, items: data ?? [] });
  }

  if (req.method === "POST") {
    const slug = String(req.body?.slug ?? "").trim();
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const comment = String(req.body?.comment ?? "").trim();
    const captchaToken = String(req.body?.captcha_token ?? "").trim();
    const captchaAnswer = String(req.body?.captcha_answer ?? "").trim();
    const honeypot = String(req.body?.website ?? "").trim();

    if (honeypot) return res.status(400).json({ error: "Requisicao invalida" });
    if (!slug || !name || !email || !comment) return res.status(400).json({ error: "Campos obrigatorios faltando" });
    if (!isEmail(email)) return res.status(400).json({ error: "Email invalido" });
    if (comment.length < 3 || comment.length > 4000) return res.status(400).json({ error: "Comentario invalido" });
    if (!verifySimpleCaptcha(captchaToken, captchaAnswer)) return res.status(400).json({ error: "Captcha invalido" });

    const { data: post, error: postErr } = await supabase.from(postsTable).select("id").eq("slug", slug).maybeSingle();
    if (postErr) return res.status(500).json({ error: postErr.message });
    if (!post) return res.status(404).json({ error: "Post nao encontrado" });

    const ip = String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").slice(0, 120);
    const ua = String(req.headers["user-agent"] ?? "").slice(0, 500);

    const { error } = await supabase.from(commentsTable).insert({
      post_id: post.id,
      name,
      email,
      comment,
      status: "pending",
      ip_address: ip || null,
      user_agent: ua || null
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true, message: "Comentario enviado para moderacao." });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

