import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../lib/require-auth.js";
import { postsTable, supabase } from "../lib/supabase.js";
const commentsTable = process.env.SUPABASE_COMMENTS_TABLE ?? "post_comments";

type PostLite = {
  id: number;
  title: string | null;
  slug: string | null;
  status: string | null;
  published_at: string | null;
  updated_at: string | null;
  view_count: number | null;
  meta_description: string | null;
  focus_keyword: string | null;
  featured_image: string | null;
};

function safeDate(value: string | null): number {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAuth(req, res)) {
    return;
  }

  const { data, error } = await supabase
    .from(postsTable)
    .select(
      "id,title,slug,status,published_at,updated_at,view_count,meta_description,focus_keyword,featured_image",
    )
    .limit(5000);

  if (error) {
    return res.status(500).json({ error: "Failed to load dashboard", detail: error.message });
  }
  const { count: pendingComments, error: commentsErr } = await supabase
    .from(commentsTable)
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (commentsErr) {
    return res.status(500).json({ error: "Failed to load comments summary", detail: commentsErr.message });
  }

  const items = (data ?? []) as PostLite[];
  const now = Date.now();

  let published = 0;
  let drafts = 0;
  let scheduled = 0;
  let seoPending = 0;
  let totalViews = 0;

  for (const post of items) {
    const status = post.status ?? "draft";
    const publishTs = safeDate(post.published_at);
    const isLivePublished = status === "published" && (publishTs === 0 || publishTs <= now);
    const isLiveScheduled = status === "scheduled" && publishTs > 0 && publishTs <= now;
    if (isLivePublished || isLiveScheduled) published += 1;
    else if (status === "scheduled") scheduled += 1;
    else drafts += 1;

    const missingMeta = !post.meta_description || !post.meta_description.trim();
    const missingKeyword = !post.focus_keyword || !post.focus_keyword.trim();
    if (missingMeta || missingKeyword) seoPending += 1;

    totalViews += Number(post.view_count ?? 0);
  }

  const topViewed = [...items]
    .sort((a, b) => Number(b.view_count ?? 0) - Number(a.view_count ?? 0))
    .slice(0, 5);

  const nextScheduled = items
    .filter((p) => (p.status ?? "draft") === "scheduled" && safeDate(p.published_at) > now)
    .sort((a, b) => safeDate(a.published_at) - safeDate(b.published_at))
    .slice(0, 5);

  const recentUpdated = [...items]
    .sort((a, b) => safeDate(b.updated_at) - safeDate(a.updated_at))
    .slice(0, 5);

  return res.status(200).json({
    ok: true,
    totals: {
      totalPosts: items.length,
      published,
      drafts,
      scheduled,
      seoPending,
      totalViews,
      pendingComments: pendingComments ?? 0
    },
    topViewed,
    nextScheduled,
    recentUpdated
  });
}

