import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../lib/require-auth.js";
import { importPostsFromMysql } from "../services/import-posts.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAuth(req, res)) {
    return;
  }

  try {
    const limit = typeof req.body?.limit === "number" ? req.body.limit : undefined;
    const result = await importPostsFromMysql(limit);

    return res.status(200).json({
      ok: true,
      ...result
    });
  } catch (error) {
    const message = (() => {
      if (error instanceof Error && error.message) {
        return error.message;
      }
      if (typeof error === "string" && error.trim().length > 0) {
        return error;
      }
      try {
        return JSON.stringify(error);
      } catch {
        return "Unknown error";
      }
    })();
    return res.status(500).json({
      ok: false,
      error: "Failed to import posts",
      detail: message
    });
  }
}
