import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyPublicCors, preflightPublic } from "../../lib/cors-public.js";
import {
  bumpChannelCounts,
  isPostVisible,
  normalizePagePath,
  parseShareChannel,
} from "../../lib/share-stats.js";
import { postsTable, supabase } from "../../lib/supabase.js";

const PAGE_STATS_TABLE = "page_share_stats";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyPublicCors(res);
  if (preflightPublic(req.method, res)) {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const channel = parseShareChannel(req.body?.channel);
  if (!channel) {
    return res.status(400).json({ error: "channel invalido (whatsapp, linkedin, facebook, twitter, copy)" });
  }

  const slug = typeof req.body?.slug === "string" ? req.body.slug.trim() : "";

  if (slug) {
    const { data: row, error: selErr } = await supabase
      .from(postsTable)
      .select("id, share_count, share_counts_by_channel, status, published_at")
      .eq("slug", slug)
      .maybeSingle();

    if (selErr) {
      return res.status(500).json({ error: selErr.message });
    }
    if (!row || !isPostVisible(row.status, row.published_at)) {
      return res.status(404).json({ error: "Post nao encontrado" });
    }

    const channels = bumpChannelCounts(
      row.share_counts_by_channel as Record<string, number> | null,
      channel,
    );
    const nextCount = Number(row.share_count ?? 0) + 1;

    const { error: upErr } = await supabase
      .from(postsTable)
      .update({ share_count: nextCount, share_counts_by_channel: channels })
      .eq("id", row.id);

    if (upErr) {
      return res.status(500).json({ error: upErr.message });
    }

    return res.status(200).json({ ok: true, type: "post", share_count: nextCount, share_counts_by_channel: channels });
  }

  const path = normalizePagePath(req.body?.path ?? req.body?.url);
  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    return res.status(400).json({ error: "Use slug para posts do blog" });
  }

  const { data: existing, error: selErr } = await supabase
    .from(PAGE_STATS_TABLE)
    .select("path, share_count, share_counts_by_channel")
    .eq("path", path)
    .maybeSingle();

  if (selErr) {
    return res.status(500).json({ error: selErr.message });
  }

  const channels = bumpChannelCounts(
    existing?.share_counts_by_channel as Record<string, number> | null,
    channel,
  );
  const nextCount = Number(existing?.share_count ?? 0) + 1;
  const now = new Date().toISOString();

  const { error: upErr } = await supabase.from(PAGE_STATS_TABLE).upsert(
    {
      path,
      share_count: nextCount,
      share_counts_by_channel: channels,
      updated_at: now,
    },
    { onConflict: "path" },
  );

  if (upErr) {
    return res.status(500).json({ error: upErr.message });
  }

  return res.status(200).json({ ok: true, type: "page", path, share_count: nextCount, share_counts_by_channel: channels });
}
