import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../lib/require-auth.js";
import { postsTable, supabase } from "../lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAuth(req, res)) {
    return;
  }

  const limitParam = req.query.limit;
  const rawLimit = Array.isArray(limitParam) ? limitParam[0] : limitParam;
  const limit = rawLimit ? Number(rawLimit) : 20;

  const { data, error } = await supabase
    .from(postsTable)
    .select("*")
    .order("published_at", { ascending: false })
    .limit(Number.isNaN(limit) ? 20 : limit);

  if (error) {
    return res.status(500).json({
      error: "Failed to fetch posts",
      detail: error.message
    });
  }

  return res.status(200).json({
    count: data.length,
    items: data
  });
}
